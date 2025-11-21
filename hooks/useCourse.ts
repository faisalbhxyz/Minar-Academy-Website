import { create } from "zustand";

type State = {
  courseTitle: string | null;
  lessonVideo: string | null;
  lessonTitle: string | null;
  isShowLessonModal: boolean;
  toggleLessonModal: (
    courseTitle: string | null,
    lessonTitle: string | null,
    video?: string | null
  ) => void;
};

const useCourseStore = create<State>((set) => ({
  courseTitle: null,
  lessonVideo: null,
  lessonTitle: null,
  isShowLessonModal: false,
  toggleLessonModal: (courseTitle, lessonTitle, video) =>
    set((state) => {
      const willShow = !state.isShowLessonModal;
      return {
        isShowLessonModal: willShow,
        lessonVideo: willShow ? video : null,
        courseTitle: willShow ? courseTitle : null,
        lessonTitle: willShow ? lessonTitle : null,
      };
    }),
}));

export default useCourseStore;
