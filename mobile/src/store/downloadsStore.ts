import { create } from "zustand";

import { t } from "@/i18n";

import {
  downloadLessonVideo,
  loadDownloadIndex,
  pruneMissingDownloads,
  removeDownloadedLesson,
  type OfflineDownload,
} from "@/lib/offlineDownloads";

export type PendingDownloadMeta = {
  lessonId: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
  lessonDescription?: string | null;
  sourceType: string;
  /**
   * `api` — authenticated lesson offline video (default).
   * `direct` — PDF/material URL only.
   */
  mode?: "api" | "direct";
  /** Required when mode is `direct`. */
  remoteUrl?: string;
};

type DownloadsState = {
  ready: boolean;
  items: Record<number, OfflineDownload>;
  pendingMeta: Record<number, PendingDownloadMeta>;
  progress: Record<number, number>;
  downloading: Record<number, boolean>;
  errors: Record<number, string>;
  hydrate: () => Promise<void>;
  startDownload: (params: PendingDownloadMeta) => Promise<void>;
  remove: (lessonId: number) => Promise<void>;
  clearError: (lessonId: number) => void;
};

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  ready: false,
  items: {},
  pendingMeta: {},
  progress: {},
  downloading: {},
  errors: {},

  hydrate: async () => {
    const loaded = await loadDownloadIndex();
    const items = await pruneMissingDownloads(loaded);
    set({ items, ready: true });
  },

  startDownload: async (params) => {
    const { lessonId } = params;
    if (get().downloading[lessonId]) return;
    if (get().items[lessonId]) return;

    set((s) => ({
      downloading: { ...s.downloading, [lessonId]: true },
      pendingMeta: { ...s.pendingMeta, [lessonId]: params },
      progress: { ...s.progress, [lessonId]: 0 },
      errors: { ...s.errors, [lessonId]: "" },
    }));

    try {
      const item = await downloadLessonVideo({
        ...params,
        mode: params.mode ?? (params.remoteUrl ? "direct" : "api"),
        onProgress: (p) => {
          set((s) => ({
            progress: { ...s.progress, [lessonId]: p },
          }));
        },
      });
      set((s) => {
        const downloading = { ...s.downloading };
        delete downloading[lessonId];
        const pendingMeta = { ...s.pendingMeta };
        delete pendingMeta[lessonId];
        const progress = { ...s.progress };
        delete progress[lessonId];
        return {
          items: { ...s.items, [lessonId]: item },
          downloading,
          pendingMeta,
          progress,
        };
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errors.download.failed");
      set((s) => {
        const downloading = { ...s.downloading };
        delete downloading[lessonId];
        const pendingMeta = { ...s.pendingMeta };
        delete pendingMeta[lessonId];
        const progress = { ...s.progress };
        delete progress[lessonId];
        return {
          downloading,
          pendingMeta,
          progress,
          errors: { ...s.errors, [lessonId]: message },
        };
      });
      throw err;
    }
  },

  remove: async (lessonId) => {
    const items = await removeDownloadedLesson(lessonId);
    set((s) => {
      const progress = { ...s.progress };
      const downloading = { ...s.downloading };
      const pendingMeta = { ...s.pendingMeta };
      const errors = { ...s.errors };
      delete progress[lessonId];
      delete downloading[lessonId];
      delete pendingMeta[lessonId];
      delete errors[lessonId];
      return { items, progress, downloading, pendingMeta, errors };
    });
  },

  clearError: (lessonId) => {
    set((s) => {
      const errors = { ...s.errors };
      delete errors[lessonId];
      return { errors };
    });
  },
}));
