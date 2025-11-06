"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LessonItem from './LessonItem';
import { ChapterItemProps } from './types';

const ChapterItem: React.FC<ChapterItemProps> = ({ chapter, activeLesson, setActiveLesson }) => {
  const [isOpen, setIsOpen] = useState(true); // Chapter is open by default

  return (
    <div className="mb-2 rounded-lg overflow-hidden">
      <button
        className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex-grow text-left">{chapter.title}</span>
        <span className="text-sm text-gray-500 mx-2 whitespace-nowrap">
          {chapter.completedLessons}/{chapter.totalLessons}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-1">
          {chapter.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isActive={activeLesson?.id === lesson.id}
              onClick={() => setActiveLesson(lesson)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChapterItem;