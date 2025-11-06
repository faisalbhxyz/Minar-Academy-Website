"use client";

import React from "react";
import YouTubeVideoPlayer from "./YouTubeVideoPlayer";
import { Lesson } from "./types";

interface VideoPlayerSectionProps {
  activeLesson: Lesson | null;
  currentLessonTitle: string;
  instructorName: string;
  instructorTitle: string;
}

const VideoPlayerSection: React.FC<VideoPlayerSectionProps> = ({
  activeLesson,
  currentLessonTitle,
  instructorName,
  instructorTitle,
}) => {
  return (
    <div className="w-full bg-gray-900 rounded-lg shadow-xl mb-6 overflow-hidden">
      {activeLesson?.videoSource?.type !== "none" &&
      activeLesson?.videoSource?.value ? (
        <div className="relative w-full aspect-video sm:aspect-[16/9]">
          <YouTubeVideoPlayer videoSource={activeLesson.videoSource} />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full aspect-video bg-gray-800 text-white text-center text-sm sm:text-base p-4">
          Select a lesson to start or no video available.
        </div>
      )}

      {/* Lesson Info Section */}
      <div className="p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          {currentLessonTitle || "No Lesson Selected"}
        </h2>
        <p className="text-sm sm:text-base text-gray-400">
          {instructorName && instructorTitle
            ? `${instructorName} • ${instructorTitle}`
            : ""}
        </p>
      </div>
    </div>
  );
};

export default VideoPlayerSection;
