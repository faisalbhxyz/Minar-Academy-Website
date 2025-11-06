import useCourseStore from "@/hooks/useCourse";
import React, { useState } from "react";
import { FaCirclePlay, FaPlus } from "react-icons/fa6";
import { LuListChecks, LuNotepadText } from "react-icons/lu";

export default function CourseSubjects({
  chapters,
}: {
  chapters: CourseChapter[];
}) {
  const [courseSub, setCourseSub] = useState(1);
  const [isPlusAccording, setIsPlusAccording] = useState<number | null>(null);
  const { toggleLessonModal } = useCourseStore();

  const handleBorderClick = (index: number) =>
    setIsPlusAccording((prevIndex) => (prevIndex === index ? null : index));

  if (chapters && chapters.length == 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <p className="text-3xl font-semibold text-center">কোর্সের বিষয়বস্তু</p>
      {/* tabs */}
      <ul className="flex items-center justify-center flex-wrap gap-3 mt-10">
        {[{ id: 1, label: "কোর্স মডিউল" }].map((tab) => (
          <li
            key={tab.id}
            className={`${
              courseSub === tab.id ? "bg-primary text-white" : "bg-gray-100"
            } px-6 py-2 rounded-full text-[#424242] transition duration-300 border-transparent cursor-pointer`}
            onClick={() => setCourseSub(tab.id)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
      <div className="mt-10">
        {courseSub === 1 && (
          <div className="space-y-3">
            {chapters
              ?.filter(
                (chapter) =>
                  (chapter.course_lessons &&
                    chapter.course_lessons?.length > 0) ||
                  (chapter.assignments && chapter.assignments?.length > 0) ||
                  (chapter.quizzes && chapter.quizzes?.length > 0)
              )
              .map((chapter, index) => (
                <article
                  key={index}
                  className="bg-gray-100 border border-[#e5eaf2] rounded p-3"
                >
                  <div
                    className="flex gap-2 cursor-pointer items-center justify-between w-full"
                    onClick={() => handleBorderClick(index)}
                  >
                    <h2 className="text-lg font-medium">{chapter.title}</h2>
                    <p>
                      <FaPlus
                        className={`text-[1.3rem] text-text transition-all duration-300 ${
                          isPlusAccording === index &&
                          "rotate-[45deg] text-secondary"
                        }`}
                      />
                    </p>
                  </div>
                  <div
                    className={`grid transition-all duration-300 overflow-hidden ease-in-out ${
                      isPlusAccording === index
                        ? "grid-rows-[1fr] opacity-100 mt-4"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="text-[#424242] overflow-hidden">
                      {chapter.course_lessons?.map((lesson, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full flex gap-5 items-center p-1 cursor-pointer"
                          onClick={() =>
                            toggleLessonModal(
                              lesson.title,
                              lesson.source.data.data
                            )
                          }
                          disabled={!lesson.is_public}
                        >
                          <FaCirclePlay
                            size={17}
                            className={
                              lesson.is_public
                                ? `text-green-600`
                                : `text-gray-600`
                            }
                          />
                          <div className="w-full flex items-center justify-between">
                            <p className="text-base font-medium text-gray-700">
                              {lesson.title}
                            </p>
                            {lesson.is_public && (
                              <p className="text-base font-medium text-green-500">
                                ফ্রী দেখুন
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                      {chapter.assignments?.map((assignemnt, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full flex gap-5 items-center p-1 cursor-pointer"
                        >
                          <LuNotepadText size={17} className="text-gray-600" />
                          <div className="w-full flex items-center justify-between">
                            <p className="text-base font-medium text-gray-700">
                              {assignemnt.title}
                            </p>
                          </div>
                        </button>
                      ))}
                      {chapter.quizzes?.map((quiz, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full flex gap-5 items-center p-1 cursor-pointer"
                        >
                          <LuListChecks size={17} className="text-gray-600" />
                          <div className="w-full flex items-center justify-between">
                            <p className="text-base font-medium text-gray-700">
                              {quiz.title}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
