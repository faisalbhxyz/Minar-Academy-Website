"use client";

import React, { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal";
import useCourseStore from "@/hooks/useCourse";

export default function LessonVideoCard() {
  const {
    isShowLessonModal: isOpen,
    toggleLessonModal: setIsOpen,
    lessonVideo: video,
    lessonTitle,
  } = useCourseStore();

  const isIframe = video?.includes("<iframe");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // For YouTube embed URL with no controls and branding
  function getYoutubeEmbedUrl(url: string) {
    const videoId = extractVideoId(url);
    // Params to hide controls, branding, keyboard, related videos
    return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&iv_load_policy=3&fs=0&playsinline=1&enablejsapi=1`;
  }

  // Send postMessage to iframe to control playback and sound for YouTube IFrame API
  const postMessageToYoutube = (command: string, value?: any) => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: command,
        args: value !== undefined ? [value] : [],
      }),
      "*"
    );
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (!playing) {
      postMessageToYoutube("playVideo");
      setPlaying(true);
    } else {
      postMessageToYoutube("pauseVideo");
      setPlaying(false);
    }
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (!muted) {
      postMessageToYoutube("mute");
      setMuted(true);
    } else {
      postMessageToYoutube("unMute");
      setMuted(false);
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    postMessageToYoutube("setPlaybackRate", rate);
    setPlaybackRate(rate);
  };

  // When modal closes, stop video and reset states
  useEffect(() => {
    if (!isOpen) {
      setPlaying(false);
      setMuted(false);
      setPlaybackRate(1);
      // Stop the video when modal closes
      if (iframeRef.current) {
        postMessageToYoutube("stopVideo");
      }
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen()}>
      <div className="relative w-full max-w-4xl mx-auto bg-[#121212] rounded-lg overflow-hidden shadow-lg text-white">
        {/* Header with Title and Close */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <div>
            <p className="text-sm font-semibold text-gray-400">
              Course Preview
            </p>
            <h2 className="text-xl font-bold">
              {lessonTitle || "Untitled Lesson"}
            </h2>
          </div>
          <button
            onClick={() => setIsOpen()}
            className="text-3xl text-gray-400 hover:text-white transition"
            aria-label="Close video modal"
          >
            &times;
          </button>
        </div>

        {/* Video container */}
        <div className="w-full aspect-video relative bg-black">
          {video ? (
            isIframe ? (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: video }}
              />
            ) : (
              <iframe
                ref={iframeRef}
                src={getYoutubeEmbedUrl(video)}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Lesson Video"
                frameBorder="0"
              />
            )
          ) : (
            <p className="text-gray-500 text-center mt-12">
              No video available
            </p>
          )}

          {/* Custom Controls Overlay */}
          {video && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black bg-opacity-60 rounded-md px-4 py-2">
              <button
                onClick={handlePlayPause}
                className="text-white text-lg font-semibold hover:text-green-400 transition"
                aria-label={playing ? "Pause video" : "Play video"}
              >
                {playing ? "⏸️" : "▶️"}
              </button>
              <button
                onClick={handleMuteToggle}
                className="text-white text-lg font-semibold hover:text-green-400 transition"
                aria-label={muted ? "Unmute video" : "Mute video"}
              >
                {muted ? "🔇" : "🔊"}
              </button>

              <select
                value={playbackRate}
                onChange={(e) =>
                  handlePlaybackRateChange(Number(e.target.value))
                }
                className="bg-transparent text-white text-sm font-medium cursor-pointer"
                aria-label="Playback speed"
              >
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Helper function to extract video ID from full YouTube URL
function extractVideoId(url: string): string {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop() || ""
    );
  } catch {
    return url; // fallback if it's already a video ID
  }
}
