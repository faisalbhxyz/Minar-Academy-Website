"use client";

import React from 'react';
import { X } from 'lucide-react';
import ChapterItem from './ChapterItem';
import { Chapter, Lesson } from './types';

interface CourseSidebarProps {
  chapters: Chapter[];
  activeLesson: Lesson | null;
  setActiveLesson: (lesson: Lesson) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean; // New prop to determine mobile view
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  chapters,
  activeLesson,
  setActiveLesson,
  sidebarOpen,
  setSidebarOpen,
  isMobile
}) => {
  return (
    // Mobile Overlay / Desktop Sidebar
    <aside
      className={`fixed inset-0 z-40 bg-white shadow-lg p-4 flex-col transition-transform duration-300 ease-in-out
                 md:relative md:flex md:w-80 md:translate-x-0 md:shadow-none // Desktop styles
                 ${sidebarOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex'}`} // Mobile: hidden or slide out
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">Course Content</h2>
        {isMobile && ( // Only show close button on mobile
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Chapters and Lessons */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            activeLesson={activeLesson}
            setActiveLesson={setActiveLesson}
          />
        ))}
      </div>
    </aside>
  );
};

export default CourseSidebar;