// store/useToggleStore.ts
import { create } from "zustand";

type ToggleState = {
  isShow: boolean;
  toggle: () => void;
  set: (val: boolean) => void;
};

const useToggleStore = create<ToggleState>((set) => ({
  isShow: false,
  toggle: () => set((state) => ({ isShow: !state.isShow })),
  set: (val: boolean) => set({ isShow: val }),
}));

export default useToggleStore;
