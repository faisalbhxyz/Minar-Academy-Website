"use client";

import React, { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface LessonVideoPlayerProps {
  provider: "youtube" | "vimeo";
  videoId: string;
  autoPlay?: boolean;
}

export default function LessonVideoPlayer({
  provider,
  videoId,
  autoPlay = false,
}: LessonVideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<Plyr | null>(null);

  // NEW STATE: Controls whether the Plyr iframe is mounted/visible
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

  const formatTime = (sec: number) => {
    if (typeof sec !== "number" || sec < 0 || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    // Only proceed if the player should be visible AND the ref exists
    if (!playerRef.current || !isPlayerVisible) {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
      return
    }

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

    instance.on("ready", () => {
      setDuration(formatTime(instance.duration));
      setVolume(instance.volume);
      if (autoPlay) {
        instance.play();
      }
    });

    instance.on("timeupdate", () => {
      setCurrentTime(formatTime(instance.currentTime));
      setProgress((instance.currentTime / instance.duration) * 100);
    });

    instance.on("play", () => setPlaying(true));
    instance.on("pause", () => setPlaying(false));
    instance.on("volumechange", () => {
      setMuted(instance.muted);
      setVolume(instance.volume);
    });

    // Cleanup function
    return () => {
      if (playerInstance.current) playerInstance.current.destroy();
      if (hideControlsTimeout.current)
        clearTimeout(hideControlsTimeout.current);
      playerInstance.current = null;
    };
  }, [provider, isPlayerVisible]);

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
      // First click: Show player and start initialization (which will auto-play)
      setIsPlayerVisible(true);
    } else {
      // Subsequent clicks: Use Plyr's togglePlay function
      player.togglePlay();
    }
  };

  const toggleMute = () => {
    const player = playerInstance.current;
    if (!player) return;
    player.muted = !player.muted;
  };
  const restartVideo = () => playerInstance.current?.restart();

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

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video bg-black select-none overflow-hidden"
      onClick={() => {
        const player = playerInstance.current;
        if (!player) {
          setIsPlayerVisible(true); // first click shows player
        } else {
          if (playing) player.pause();
          else player.play();
        }
      }}
    >
      {/* 2. Plyr Container (Only mounted/visible when clicked) */}
      {isPlayerVisible && (
        <div
          ref={playerRef}
          data-plyr-provider={provider}
          data-plyr-embed-id={videoId}
          className={`w-full h-full relative z-20`}
        />
      )}

      {/* 3. Transparent event-interception overlay (Z-index 30) */}
      <div
        className="absolute inset-0 z-30 cursor-none"
        onMouseMove={handleMouseMove}
      />

      {/* 4. Controls Overlay (Z-index 40) */}
      {showControls && (
        <div className="absolute inset-0 flex flex-col justify-end px-4 py-3 z-40">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          <div className="relative flex flex-col justify-end h-full pointer-events-auto">
            <div className="flex justify-between text-white text-sm mb-1">
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

            <div className="mt-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay}>
                  {playing ? <Pause size={22} /> : <Play size={22} />}
                </button>

                {isPlayerVisible && (
                  <div
                    className="relative flex flex-col items-center"
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                  >
                    <button onClick={toggleMute}>
                      {muted || volume === 0 ? (
                        <VolumeX size={22} />
                      ) : (
                        <Volume2 size={22} />
                      )}
                    </button>

                    {showVolume && (
                      <div className="absolute -bottom-1.5 left-5 flex flex-col items-center p-2 rounded">
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
                      className="flex items-center gap-1"
                      onClick={() => setSpeedMenu((p) => !p)}
                    >
                      {currentSpeed}x{" "}
                      {speedMenu ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {speedMenu && (
                      <div className="absolute bottom-7 right-0 bg-black/80 rounded p-2 text-sm space-y-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <div
                            key={s}
                            onClick={() => changeSpeed(s)}
                            className={`px-2 py-1 rounded hover:bg-white/20 cursor-pointer ${
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

                <button onClick={toggleFullscreen} disabled={!isPlayerVisible}>
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
          /* Force poster to render on pause */
          background: #000; /* or use a custom color or image */
        }

        .plyr__poster {
          /* Force poster to cover the video */
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
