"use client";

import React from "react";
import { Lesson } from "./types";

interface YouTubeVideoPlayerProps {
  videoSource: Lesson["videoSource"];
}

const buildYouTubeEmbedUrl = (videoId: string): string => {
  const params = {
    autoplay: 1,
    controls: 1,
    rel: 0,
    loop: 0,
    playlist: videoId,
    iv_load_policy: 3,
    disablekb: 1,
    playsinline: 1,
  };
  const paramString = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `https://www.youtube.com/embed/${videoId}?${paramString}`;
};

const extractYouTubeIdFromIframe = (html: string): string | null => {
  const match = html.match(
    /src=["'](?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"']+)/
  );
  if (!match?.[1]) return null;
  return match[1].split("?")[0];
};

const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({ videoSource }) => {
  let src: string | null = null;

  if (videoSource.type === "youtubeId") {
    src = buildYouTubeEmbedUrl(videoSource.value);
  } else if (videoSource.type === "iframe") {
    const id = extractYouTubeIdFromIframe(videoSource.value);
    if (id) src = buildYouTubeEmbedUrl(id);
  }

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
        Invalid video source
      </div>
    );
  }

  return (
    <iframe
      src={src}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      loading="lazy"
      // these inline styles ensure iframe fills the wrapper
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "0",
      }}
    />
  );
};

export default YouTubeVideoPlayer;
