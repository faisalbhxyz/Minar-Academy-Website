"use client";

import React from 'react';
import { ChevronLeft, CheckCircle, X } from 'lucide-react';

interface CourseHeaderProps {
  currentLessonTitle: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean; // New prop to determine mobile view
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  currentLessonTitle,
  progress,
  setSidebarOpen,
  isMobile
}) => {
  return (
    <header className="bg-white shadow-sm md:shadow-none p-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-4">
        {isMobile && ( // Only show toggle button on mobile
          <button
            onClick={() => setSidebarOpen(true)} // Open sidebar/overlay
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-medium text-gray-800 truncate max-w-xs sm:max-w-md md:max-w-lg">
          {currentLessonTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 whitespace-nowrap">
          Your Progress: <span className="font-semibold">{progress.completed} of {progress.total}</span> ({progress.percentage}%)
        </div>
        <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <CheckCircle className="w-4 h-4" />
          Mark as Complete
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close course"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default CourseHeader;