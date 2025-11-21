"use client";

import React, { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal";
import useCourseStore from "@/hooks/useCourse";
import LessonVideoPlayer from "../course-viewer/LessonVideoPlayer";

export default function LessonVideoCard() {
  const {
    courseTitle,
    isShowLessonModal: isOpen,
    toggleLessonModal,
    lessonVideo: video,
    lessonTitle,
  } = useCourseStore();

  const videoId = extractVideoId(video || "");

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => toggleLessonModal(null, null, null)}
      className="bg-gray-50 p-1 rounded-sm"
    >
      <h3 className="text-xl font-semibold mb-2 text-center">{courseTitle}</h3>
      <h5 className="text-base text-gray-700 font-semibold mb-2 text-center">{lessonTitle}</h5>
      <LessonVideoPlayer provider="youtube" videoId={videoId} autoPlay />
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
    return url;
  }
}
