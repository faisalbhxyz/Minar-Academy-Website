import { create } from "zustand";

type State = {
  lessonVideo: string | null;
  lessonTitle: string | null;
  isShowLessonModal: boolean;
  toggleLessonModal: (title?: string | null, video?: string | null) => void;
};

const useCourseStore = create<State>((set) => ({
  lessonVideo: null,
  lessonTitle: null,
  isShowLessonModal: false,
  toggleLessonModal: (title, video) =>
    set((state) => {
      const willShow = !state.isShowLessonModal;
      return {
        isShowLessonModal: willShow,
        lessonVideo: willShow ? video : null,
        lessonTitle: willShow ? title : null,
      };
    }),
}));

export default useCourseStore;
