"use client";

import React from 'react';
import { Lesson } from './types'; // Import Lesson type for description/resources

interface LessonContentProps {
  activeLesson: Lesson | null;
}

const LessonContent: React.FC<LessonContentProps> = ({ activeLesson }) => {
  if (!activeLesson) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lesson Details</h2>
        <p className="text-gray-700 leading-relaxed">
          Please select a lesson from the sidebar to view its content and resources.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Lesson Description</h2>
      {activeLesson.description ? (
        <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: activeLesson.description }} />
      ) : (
        <p className="text-gray-700 leading-relaxed">No description available for this lesson.</p>
      )}

      {activeLesson.resources && Object.keys(activeLesson.resources).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800">Resources for this Lesson:</h3>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {Object.entries(activeLesson.resources).map(([filename, url]) => (
              <li key={filename}>
                <a href={url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LessonContent;