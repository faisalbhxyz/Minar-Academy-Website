"use client";

import React, { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  LESSON_COMPLETE_THRESHOLD,
  WATCH_SAVE_INTERVAL_MS,
  loadWatchPosition,
  postLessonComplete,
  saveWatchPosition,
  type CourseProgressData,
} from "@/lib/courseProgressApi";
import { flushWatchSeconds, type WatchTimeSource } from "@/lib/watchTimeApi";

interface LessonVideoPlayerProps {
  provider: "youtube" | "vimeo";
  videoId: string;
  autoPlay?: boolean;
  lessonId?: number;
  courseId?: number;
  courseSlug?: string;
  accessToken?: string;
  studentId?: string;
  watchSource?: WatchTimeSource;
  isAlreadyCompleted?: boolean;
  onLessonCompleted?: (
    lessonId: number,
    progress?: CourseProgressData | null
  ) => void;
}

/** Ignore gaps larger than this — pause / seek / tab blur. */
const MAX_TICK_GAP_SECONDS = 4;

export default function LessonVideoPlayer({
  provider,
  videoId,
  autoPlay = false,
  lessonId,
  courseId,
  courseSlug,
  accessToken,
  studentId,
  watchSource = "enrolled",
  isAlreadyCompleted = false,
  onLessonCompleted,
}: LessonVideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<Plyr | null>(null);
  const maxPositionRef = useRef(0);
  const completePostedRef = useRef(isAlreadyCompleted);
  const lastSaveRef = useRef(0);
  const lastTickAtRef = useRef<number | null>(null);
  const pendingWatchSecondsRef = useRef(0);
  const onLessonCompletedRef = useRef(onLessonCompleted);

  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speedMenu, setSpeedMenu] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onLessonCompletedRef.current = onLessonCompleted;
  }, [onLessonCompleted]);

  useEffect(() => {
    completePostedRef.current = isAlreadyCompleted;
    maxPositionRef.current = 0;
    lastSaveRef.current = 0;
    lastTickAtRef.current = null;
    pendingWatchSecondsRef.current = 0;
  }, [lessonId, isAlreadyCompleted]);

  const formatTime = (sec: number) => {
    if (typeof sec !== "number" || sec < 0 || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!playerRef.current || !isPlayerVisible) {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
      return;
    }

    const trackingEnabled =
      lessonId != null && courseSlug && accessToken && studentId;

    const instance = new Plyr(playerRef.current, {
      controls: [],
      settings: [],
      clickToPlay: false,
      hideControls: false,
      disableContextMenu: true,
      youtube: {
        noCookie: true,
        modestbranding: true,
        controls: 0,
        rel: 0,
        iv_load_policy: 3,
        showinfo: 0,
      },
      vimeo: { portrait: false, title: false, controls: false },
      fullscreen: { enabled: false },
    });

    playerInstance.current = instance;

    const flushWatchTime = () => {
      if (!trackingEnabled || !accessToken) return;
      const seconds = Math.floor(pendingWatchSecondsRef.current);
      if (seconds < 1) return;
      pendingWatchSecondsRef.current -= seconds;
      void flushWatchSeconds({
        seconds,
        accessToken,
        courseId,
        lessonId: lessonId ?? undefined,
        source: watchSource,
      }).catch(() => undefined);
    };

    const flushWatchProgress = () => {
      flushWatchTime();
      if (!trackingEnabled || lessonId == null || maxPositionRef.current <= 0) {
        return;
      }
      void saveWatchPosition(
        courseSlug!,
        lessonId,
        maxPositionRef.current,
        instance.duration,
        accessToken!,
        studentId
      );
    };

    instance.on("ready", () => {
      setDuration(formatTime(instance.duration));
      setVolume(instance.volume);

      if (trackingEnabled && lessonId != null) {
        void loadWatchPosition(
          courseSlug!,
          lessonId,
          accessToken!,
          studentId
        ).then((saved) => {
          if (
            saved > 0 &&
            instance.duration > 0 &&
            saved < instance.duration - 5
          ) {
            instance.currentTime = saved;
            maxPositionRef.current = saved;
          }
        });

        void flushWatchSeconds({
          seconds: 0,
          accessToken: accessToken!,
        }).catch(() => undefined);
      }

      if (autoPlay) {
        instance.play();
      }
    });

    instance.on("timeupdate", () => {
      const current = instance.currentTime;
      const total = instance.duration;

      setCurrentTime(formatTime(current));
      setProgress(total > 0 ? (current / total) * 100 : 0);

      if (!trackingEnabled || !lessonId || total <= 0) return;

      if (current > maxPositionRef.current) {
        maxPositionRef.current = current;
      }

      const now = Date.now();
      if (instance.playing) {
        if (lastTickAtRef.current != null) {
          const gapSec = (now - lastTickAtRef.current) / 1000;
          if (gapSec > 0 && gapSec <= MAX_TICK_GAP_SECONDS) {
            pendingWatchSecondsRef.current += gapSec;
          }
        }
        lastTickAtRef.current = now;
      } else {
        lastTickAtRef.current = null;
      }

      if (now - lastSaveRef.current >= WATCH_SAVE_INTERVAL_MS) {
        lastSaveRef.current = now;
        flushWatchProgress();
      }

      if (
        !completePostedRef.current &&
        maxPositionRef.current / total >= LESSON_COMPLETE_THRESHOLD
      ) {
        completePostedRef.current = true;
        flushWatchProgress();
        void postLessonComplete(courseSlug!, lessonId, accessToken!).then(
          (progress) => {
            onLessonCompletedRef.current?.(lessonId, progress);
          }
        );
      }
    });

    instance.on("play", () => {
      setPlaying(true);
      lastTickAtRef.current = Date.now();
    });
    instance.on("pause", () => {
      setPlaying(false);
      lastTickAtRef.current = null;
      flushWatchProgress();
    });
    instance.on("ended", () => {
      lastTickAtRef.current = null;
      flushWatchProgress();
    });
    instance.on("volumechange", () => {
      setMuted(instance.muted);
      setVolume(instance.volume);
    });

    return () => {
      flushWatchProgress();
      if (playerInstance.current) playerInstance.current.destroy();
      if (hideControlsTimeout.current)
        clearTimeout(hideControlsTimeout.current);
      playerInstance.current = null;
    };
  }, [
    provider,
    videoId,
    isPlayerVisible,
    autoPlay,
    lessonId,
    courseId,
    courseSlug,
    accessToken,
    studentId,
    watchSource,
  ]);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) wrapperRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (playing && !speedMenu && !showVolume) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (autoPlay) {
      setIsPlayerVisible(true);
    }
  }, [autoPlay]);

  useEffect(() => {
    if (!playing || speedMenu || showVolume || !isPlayerVisible) {
      setShowControls(true);
      if (hideControlsTimeout.current)
        clearTimeout(hideControlsTimeout.current);
    } else {
      handleMouseMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speedMenu, showVolume, isPlayerVisible]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const player = playerInstance.current;
    if (!player) return;
    const percent = Number(e.target.value);
    player.currentTime = (percent / 100) * player.duration;
    setProgress(percent);
  };

  const togglePlay = () => {
    const player = playerInstance.current;
    if (!player) {
      setIsPlayerVisible(true);
    } else {
      player.togglePlay();
    }
  };

  const toggleMute = () => {
    const player = playerInstance.current;
    if (!player) return;
    player.muted = !player.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const player = playerInstance.current;
    if (!player) return;
    const v = Number(e.target.value);
    player.volume = v;
    setVolume(v);
    if (v > 0) player.muted = false;
  };

  const changeSpeed = (speed: number) => {
    const player = playerInstance.current;
    if (!player) return;
    player.speed = speed;
    setCurrentSpeed(speed);
    setSpeedMenu(false);
  };

  const handleSurfaceToggle = () => {
    const player = playerInstance.current;
    if (!player) {
      setIsPlayerVisible(true);
      return;
    }
    if (playing) player.pause();
    else void player.play();
  };

  const stopControlBubble = (
    event: React.SyntheticEvent,
    action?: () => void
  ) => {
    event.stopPropagation();
    action?.();
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video bg-black select-none overflow-hidden touch-manipulation"
    >
      {isPlayerVisible && (
        <div
          ref={playerRef}
          data-plyr-provider={provider}
          data-plyr-embed-id={videoId}
          className="relative z-20 h-full w-full"
        />
      )}

      <div
        className="absolute inset-0 z-30"
        onClick={handleSurfaceToggle}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseMove}
        aria-hidden
      />

      {showControls && (
        <div
          className="absolute inset-0 z-40 flex flex-col justify-end px-4 py-3 pointer-events-none"
          onMouseMove={handleMouseMove}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          <div
            className="relative mt-auto w-full pointer-events-auto"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            <div className="mb-1 flex justify-between text-sm text-white">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              disabled={!isPlayerVisible}
              className={`w-full accent-white ${
                !isPlayerVisible ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />

            <div className="mt-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={(event) => stopControlBubble(event, togglePlay)}
                >
                  {playing ? <Pause size={22} /> : <Play size={22} />}
                </button>

                {isPlayerVisible && (
                  <div
                    className="relative flex flex-col items-center"
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                  >
                    <button
                      type="button"
                      onClick={(event) => stopControlBubble(event, toggleMute)}
                    >
                      {muted || volume === 0 ? (
                        <VolumeX size={22} />
                      ) : (
                        <Volume2 size={22} />
                      )}
                    </button>

                    {showVolume && (
                      <div className="absolute -bottom-1.5 left-5 flex flex-col items-center rounded p-2">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-24 accent-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                {isPlayerVisible && (
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={(event) =>
                        stopControlBubble(event, () =>
                          setSpeedMenu((prev) => !prev)
                        )
                      }
                    >
                      {currentSpeed}x{" "}
                      {speedMenu ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {speedMenu && (
                      <div className="absolute bottom-7 right-0 space-y-1 rounded bg-black/80 p-2 text-sm">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <div
                            key={s}
                            onClick={(event) =>
                              stopControlBubble(event, () => changeSpeed(s))
                            }
                            className={`cursor-pointer rounded px-2 py-1 hover:bg-white/20 ${
                              currentSpeed === s ? "bg-white/20" : ""
                            }`}
                          >
                            {s}x
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={(event) =>
                    stopControlBubble(event, toggleFullscreen)
                  }
                  disabled={!isPlayerVisible}
                >
                  {isFullscreen ? (
                    <Minimize
                      size={22}
                      className={!isPlayerVisible ? "opacity-50" : ""}
                    />
                  ) : (
                    <Maximize
                      size={22}
                      className={!isPlayerVisible ? "opacity-50" : ""}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        iframe {
          pointer-events: none;
        }
        .plyr__video-embed iframe {
          top: 0;
          height: 100%;
        }

        .plyr--paused {
          background: #000;
        }

        .plyr__poster {
          background-size: cover;
          z-index: 2;
        }

        .plyr__video-embed iframe {
          top: -50%;
          height: 200%;
        }
      `}</style>
    </div>
  );
}
