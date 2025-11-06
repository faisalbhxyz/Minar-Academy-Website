"use client";

import React, { useRef, useState, useCallback } from "react";
import ReactPlayer from "react-player";

export default function SecureVideoPlayer() {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // IMPORTANT: Replace "dQw4w9WgXcQ" with your actual YouTube video ID.
  // This is the format react-player expects for YouTube videos.
  const youtubeVideoId = "dQw4w9WgXcQ"; // Example: A valid YouTube video ID
  const videoSrc = `https://www.youtube.com/watch?v=${youtubeVideoId}`; // Correct format for react-player

  const handlePlayPause = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const handleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      setMuted(newVolume === 0);
    },
    []
  );

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newProgress = parseFloat(e.target.value);
      if (playerRef.current) {
        playerRef.current.seekTo(newProgress, "fraction");
        setProgress(newProgress); // Optimistic update
      }
    },
    []
  );

  const handleProgress = useCallback(
    (state: { played: number; playedSeconds: number }) => {
      // Only update progress if not currently seeking to avoid jumpiness
      if (playerRef.current && !playerRef.current.seeking) {
        setProgress(state.played);
      }
    },
    []
  );

  const handleDuration = useCallback((d: number) => {
    setDuration(d);
  }, []);

  const onPlayerReady = useCallback(() => {
    setIsReady(true);
    console.log("ReactPlayer is ready!");
  }, []);

  const onPlayerPlay = useCallback(() => {
    setPlaying(true);
  }, []);

  const onPlayerPause = useCallback(() => {
    setPlaying(false);
  }, []);

  const onPlayerEnded = useCallback(() => {
    setPlaying(false);
    setProgress(0); // Reset progress when video ends
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes().toString().padStart(2, "0");
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    const hh = date.getUTCHours();
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }, []);

  // This config object is how react-player passes parameters to the YouTube API.
  const playerConfig: React.ComponentProps<typeof ReactPlayer>["config"] = {
    youtube: {
      // 'modestbranding' and 'showinfo' are deprecated and have no effect.
      // They are removed as per the YouTube IFrame Player API documentation.
      rel: 0, // Related videos will come from the same channel.
      iv_load_policy: 3, // Disables video annotations.
      //   playsinline: 1, // Plays inline on iOS.
      disablekb: 1, // Disables keyboard controls.
      fs: 0, // Prevents the fullscreen button from displaying.
      
      //   loop: 1, // Loops the video.
      //   playlist: youtubeVideoId, // Crucial for 'loop' to work correctly with a single video.
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
      <ReactPlayer
        ref={playerRef}
        src={videoSrc} // Using 'src' prop with a standard YouTube video URL.
        playing={playing}
        muted={muted}
        volume={volume}
        controls={false} // Hides all native YouTube player controls.
        onReady={onPlayerReady}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onPlay={onPlayerPlay}
        onPause={onPlayerPause}
        onEnded={onPlayerEnded}
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
        config={playerConfig}
      />

      {/* 🔒 Transparent Overlay: This is the most reliable way to prevent any interaction
          with the iframe content that YouTube's API doesn't allow hiding (e.g., right-click menu,
          or any residual branding/share buttons that might appear despite playerVars). */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          pointerEvents: "auto", // Crucial: This blocks clicks on the underlying iframe.
          zIndex: 1, // Ensure it's above the player but below custom controls.
        }}
        onContextMenu={(e) => e.preventDefault()} // Prevents right-click context menu on the overlay.
      />

      {/* 🎮 Custom Controls: These will be fully interactive as they are above the overlay. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 2, // Ensure controls are above the player AND the overlay.
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={handlePlayPause} disabled={!isReady}>
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={handleMute} disabled={!isReady}>
            {muted ? "Unmute" : "Mute"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{ flexGrow: 1 }}
            disabled={!isReady}
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>{formatTime(duration * progress)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step="0.0001"
            value={progress}
            onChange={handleProgressChange}
            style={{ flexGrow: 1 }}
            disabled={!isReady}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
