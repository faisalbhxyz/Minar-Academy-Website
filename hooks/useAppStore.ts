import { create } from "zustand";

type State = {
  isVideoPlay: boolean;
  toggleVideoPlay: () => void;
};

const useAppStore = create<State>((set) => ({
  isVideoPlay: false,
  toggleVideoPlay: () => set((state) => ({ isVideoPlay: !state.isVideoPlay })),
}));

export default useAppStore;
