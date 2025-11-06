"use client";

import React from 'react';
import { CheckCircle, PlayCircle, Clock } from 'lucide-react';
import { LessonItemProps } from './types';

const LessonItem: React.FC<LessonItemProps> = ({ lesson, isActive, onClick }) => {
  return (
    <li>
      <button
        className={`flex items-center w-full p-3 pl-6 text-sm rounded-lg transition-colors duration-200
                    ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onClick={onClick}
      >
        {lesson.completed ? (
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
        ) : (
          <PlayCircle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        )}
        <span className="flex-grow text-left truncate">{lesson.title}</span>
        <span className="text-gray-500 ml-2 flex-shrink-0 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {lesson.duration}
        </span>
      </button>
    </li>
  );
};

export default LessonItem;