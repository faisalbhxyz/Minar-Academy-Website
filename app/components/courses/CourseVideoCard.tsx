"use client";

import React, { useState } from "react";
import Image from "next/image";
import SafeImage from "@/app/components/SafeImage";

type CourseVideoCardProps = {
  title: string;
  description?: string;
  image?: string | null;
  video?: string | null; // Can be video ID, full URL, or iframe string
};

export default function CourseVideoCard({
  title,
  description,
  image,
  video,
}: CourseVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const isIframe = video?.includes("<iframe");
  const videoId = extractYouTubeId(video);

  const renderContent = () => {
    // 1. If iframe is passed, render it directly
    if (isIframe && video) {
      return (
        <div className="w-full h-full">
          <div
            className="w-full aspect-video"
            dangerouslySetInnerHTML={{ __html: video }}
          />
        </div>
      );
    }

    // 2. If videoId is valid
    if (videoId) {
      if (isPlaying) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
          />
        );
      }

      return (
        <div
          className="w-full h-full bg-black cursor-pointer relative"
          onClick={() => setIsPlaying(true)}
        >
          <Image
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            width={1920}
            height={1080}
            className="aspect-16/9 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white/50 rounded-full w-16 h-16 animate-ping"></div>
            <button className="absolute w-16 h-16 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <svg
                className="w-8 h-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    // 3. If only image is provided
    if (image) {
      return (
        <div className="w-full h-full bg-black relative">
          <SafeImage
            src={image}
            alt={title}
            width={1920}
            height={1080}
            className="aspect-16/9 object-cover"
          />
        </div>
      );
    }

    // Fallback
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        No content available
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-3">
      <div className="w-full aspect-video rounded-lg overflow-hidden relative">
        {renderContent()}
      </div>
    </div>
  );
}

// 🔧 Utility to extract YouTube video ID from various formats
function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;

  // Direct YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  // YouTube URL pattern
  const urlMatch = input.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (urlMatch) return urlMatch[1];

  // Extract from iframe src
  const iframeMatch = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (iframeMatch) return iframeMatch[1];

  return null;
}
