import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import * as api from "@/api";
import { t } from "@/i18n";
import {
  extractGoogleDriveFileId,
  googleDriveDirectDownloadUrl,
  isPdfFile,
} from "@/lib/format";
import type { CourseLesson } from "@/types/api";

const INDEX_KEY = "minar_offline_downloads_v1";
const DIR_NAME = "offline_lessons";

const DOWNLOAD_UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

export type OfflineDownload = {
  lessonId: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
  lessonDescription?: string | null;
  sourceType: string;
  remoteUrl: string;
  localUri: string;
  fileName?: string;
  contentType?: string;
  fileSize: number;
  downloadedAt: string;
};

export type DownloadProgress = {
  lessonId: number;
  progress: number;
};

function downloadsRoot(): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error("App storage unavailable");
  }
  return `${base}${DIR_NAME}/`;
}

function extensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (match) return match[1].toLowerCase();
  } catch {
    // ignore
  }
  return "mp4";
}

function sanitizeFileName(name: string): string {
  const trimmed = name.trim().replace(/[/\\?%*:|"<>]/g, "_");
  return trimmed || "lesson.mp4";
}

function localPathForLessonFile(
  lessonId: number,
  fileName: string
): string {
  const safe = sanitizeFileName(fileName);
  const extMatch = safe.match(/\.([a-zA-Z0-9]{2,5})$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "mp4";
  return `${downloadsRoot()}lesson_${lessonId}.${ext}`;
}

function localPathForDirectUrl(
  lessonId: number,
  remoteUrl: string,
  title = ""
): string {
  const looksPdf = isPdfFile(undefined, `${title} ${remoteUrl}`);
  const driveId = extractGoogleDriveFileId(remoteUrl);
  if (driveId) {
    return `${downloadsRoot()}lesson_${lessonId}.${looksPdf ? "pdf" : "mp4"}`;
  }
  let ext = extensionFromUrl(remoteUrl);
  if (ext === "mp4" && looksPdf) ext = "pdf";
  return `${downloadsRoot()}lesson_${lessonId}.${ext}`;
}

function isDriveFileUrl(url: string): boolean {
  return Boolean(extractGoogleDriveFileId(url));
}

function isHostedPdfUrl(url: string, title = "", mime = ""): boolean {
  const value = url.trim();
  if (!/^https?:\/\//i.test(value)) return false;
  return isPdfFile(mime, `${title} ${value}`);
}

/** Stable id for lesson materials so PDF downloads do not clash with lesson video ids. */
export function offlineIdForMaterial(url: string): number {
  let hash = 2166136261;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return -(((hash >>> 0) % 1_000_000_000) + 1);
}

/** PDF / note materials only — not lesson video offline. */
export function isDownloadableMaterial(
  url: string,
  title = "",
  mime = ""
): boolean {
  if (Platform.OS === "web") return false;
  const value = url.trim();
  if (!/^https?:\/\//i.test(value)) return false;
  if (isHostedPdfUrl(value, title, mime)) return true;
  if (isDriveFileUrl(value) && isPdfFile(mime, `${title} ${value}`)) return true;
  return false;
}

/**
 * Show Save offline only when the API marks the lesson downloadable.
 * Do not scan source.data.data for Drive links.
 */
export function isDownloadableLesson(lesson: CourseLesson): boolean {
  if (Platform.OS === "web") return false;
  return (
    lesson.lesson_type === "video" && lesson.offline_downloadable === true
  );
}

function resolveRemoteDownloadUrl(url: string, confirm = "t"): string {
  const driveId = extractGoogleDriveFileId(url);
  if (driveId) return googleDriveDirectDownloadUrl(driveId, confirm);
  return url;
}

export async function ensureDownloadsDir(): Promise<void> {
  const root = downloadsRoot();
  const info = await FileSystem.getInfoAsync(root);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(root, { intermediates: true });
  }
}

export async function loadDownloadIndex(): Promise<
  Record<number, OfflineDownload>
> {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as OfflineDownload[];
    if (!Array.isArray(parsed)) return {};
    const map: Record<number, OfflineDownload> = {};
    for (const item of parsed) {
      map[item.lessonId] = item;
    }
    return map;
  } catch {
    return {};
  }
}

async function saveDownloadIndex(
  map: Record<number, OfflineDownload>
): Promise<void> {
  const list = Object.values(map).sort(
    (a, b) =>
      new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
  );
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

export async function verifyLocalFile(localUri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(localUri);
    return info.exists && !info.isDirectory;
  } catch {
    return false;
  }
}

export async function pruneMissingDownloads(
  map: Record<number, OfflineDownload>
): Promise<Record<number, OfflineDownload>> {
  const next: Record<number, OfflineDownload> = {};
  let changed = false;
  for (const [id, item] of Object.entries(map)) {
    const ok = await verifyLocalFile(item.localUri);
    if (ok) {
      next[Number(id)] = item;
    } else {
      changed = true;
    }
  }
  if (changed) {
    await saveDownloadIndex(next);
  }
  return next;
}

const activeDownloads = new Map<number, FileSystem.DownloadResumable>();

function mapDownloadApiError(err: unknown): Error {
  if (!(err instanceof Error)) {
    return new Error(t("errors.download.failed"));
  }
  const status = (err as Error & { status?: number }).status;
  const code = ((err as Error & { code?: string }).code ?? err.message).toUpperCase();

  if (status === 401 || code === "UNAUTHORIZED") {
    return new Error(t("errors.download.unauthorized"));
  }
  if (status === 403 || code === "NOT_ENROLLED") {
    return new Error(t("errors.download.notEnrolled"));
  }
  if (status === 404 || code === "LESSON_NOT_FOUND") {
    return new Error(t("errors.download.lessonNotFound"));
  }
  if (status === 422 || code === "NOT_DOWNLOADABLE") {
    return new Error(t("errors.download.notSupported"));
  }
  if (err.message === "MISSING_DOWNLOAD_URL") {
    return new Error(t("errors.download.notSupported"));
  }
  return new Error(t("errors.download.failed"));
}

export async function downloadLessonVideo(params: {
  lessonId: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
  lessonDescription?: string | null;
  sourceType: string;
  /**
   * `api` — lesson video via GET .../download?format=json (default).
   * `direct` — PDF/material URL only (never use lesson share /view for video).
   */
  mode?: "api" | "direct";
  remoteUrl?: string;
  onProgress?: (progress: number) => void;
}): Promise<OfflineDownload> {
  const mode = params.mode ?? (params.remoteUrl ? "direct" : "api");

  if (activeDownloads.has(params.lessonId)) {
    throw new Error(t("errors.download.inProgress"));
  }

  await ensureDownloadsDir();

  let fileUrl: string;
  let fileName: string;
  let contentType: string | undefined;
  let localUri: string;

  if (mode === "api") {
    let meta;
    try {
      meta = await api.fetchLessonOfflineDownload(
        params.courseSlug,
        params.lessonId
      );
    } catch (err) {
      throw mapDownloadApiError(err);
    }
    fileUrl = meta.download_url;
    fileName = sanitizeFileName(meta.file_name || `${params.lessonTitle}.mp4`);
    contentType = meta.content_type;
    localUri = localPathForLessonFile(params.lessonId, fileName);
  } else {
    const remoteUrl = (params.remoteUrl ?? "").trim();
    if (
      !isDownloadableMaterial(
        remoteUrl,
        params.lessonTitle,
        params.sourceType === "pdf" ? "application/pdf" : ""
      )
    ) {
      throw new Error(t("errors.download.notSupported"));
    }
    fileUrl = resolveRemoteDownloadUrl(remoteUrl);
    fileName = sanitizeFileName(
      `${params.lessonTitle}.${isPdfFile(undefined, remoteUrl) ? "pdf" : "mp4"}`
    );
    localUri = localPathForDirectUrl(
      params.lessonId,
      remoteUrl,
      params.lessonTitle
    );
  }

  const existing = await FileSystem.getInfoAsync(localUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }

  const urlsToTry = [fileUrl];
  const driveId = extractGoogleDriveFileId(fileUrl);
  if (driveId) {
    urlsToTry.push(
      `https://drive.google.com/uc?export=download&confirm=t&id=${encodeURIComponent(driveId)}`
    );
  }

  try {
    const resultUri = await downloadWithFallbacks(
      params.lessonId,
      urlsToTry,
      localUri,
      driveId,
      params.onProgress
    );
    const info = await FileSystem.getInfoAsync(resultUri);
    const fileSize =
      info.exists && "size" in info && typeof info.size === "number"
        ? info.size
        : 0;
    if (fileSize < 2048) {
      throw new Error(t("errors.download.saveFailedNetwork"));
    }

    const item: OfflineDownload = {
      lessonId: params.lessonId,
      courseId: params.courseId,
      courseSlug: params.courseSlug,
      courseTitle: params.courseTitle,
      lessonTitle: params.lessonTitle,
      lessonDescription: params.lessonDescription ?? null,
      sourceType: params.sourceType,
      remoteUrl: fileUrl,
      localUri: resultUri,
      fileName,
      contentType,
      fileSize,
      downloadedAt: new Date().toISOString(),
    };

    const index = await loadDownloadIndex();
    index[params.lessonId] = item;
    await saveDownloadIndex(index);
    params.onProgress?.(1);
    return item;
  } catch (err) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
    throw err;
  } finally {
    activeDownloads.delete(params.lessonId);
  }
}

async function downloadWithFallbacks(
  lessonId: number,
  urls: string[],
  localUri: string,
  driveId: string | null,
  onProgress?: (progress: number) => void
): Promise<string> {
  let lastHtml = "";
  for (const url of urls) {
    const uri = await downloadOnce(lessonId, url, localUri, onProgress);
    if (!(await fileLooksLikeHtml(uri))) return uri;
    lastHtml = await readFileHead(uri);
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }

  const confirm = parseDriveConfirmToken(lastHtml);
  if (driveId && confirm) {
    const uri = await downloadOnce(
      lessonId,
      googleDriveDirectDownloadUrl(driveId, confirm),
      localUri,
      onProgress
    );
    if (!(await fileLooksLikeHtml(uri))) return uri;
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }

  throw new Error(t("errors.download.saveFailedRetry"));
}

async function downloadOnce(
  lessonId: number,
  url: string,
  localUri: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const resumable = FileSystem.createDownloadResumable(
    url,
    localUri,
    {
      headers: {
        "User-Agent": DOWNLOAD_UA,
      },
    },
    (data) => {
      if (data.totalBytesExpectedToWrite <= 0) return;
      onProgress?.(
        Math.min(
          1,
          Math.max(0, data.totalBytesWritten / data.totalBytesExpectedToWrite)
        )
      );
    }
  );
  activeDownloads.set(lessonId, resumable);
  const result = await resumable.downloadAsync();
  if (!result?.uri) {
    throw new Error(t("errors.download.failed"));
  }
  return result.uri;
}

async function readFileHead(uri: string): Promise<string> {
  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch {
    return "";
  }
}

async function fileLooksLikeHtml(uri: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(uri);
  const size =
    info.exists && "size" in info && typeof info.size === "number"
      ? info.size
      : 0;
  if (size > 512_000) return false;
  const head = (await readFileHead(uri)).trim().toLowerCase();
  if (!head) return false;
  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.includes("<html") ||
    head.includes("virus scan warning")
  );
}

function parseDriveConfirmToken(html: string): string | null {
  const patterns = [
    /name=["']confirm["']\s+value=["']([^"']+)["']/i,
    /confirm=([0-9A-Za-z_-]{4,})/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1] && match[1] !== "t") return match[1];
  }
  return null;
}

export async function cancelDownload(lessonId: number): Promise<void> {
  const task = activeDownloads.get(lessonId);
  if (!task) return;
  try {
    await task.pauseAsync();
  } catch {
    // ignore
  }
  activeDownloads.delete(lessonId);
}

export async function removeDownloadedLesson(
  lessonId: number
): Promise<Record<number, OfflineDownload>> {
  const index = await loadDownloadIndex();
  const item = index[lessonId];
  if (item) {
    await FileSystem.deleteAsync(item.localUri, { idempotent: true });
    delete index[lessonId];
    await saveDownloadIndex(index);
  }
  return index;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type OfflineContentKind = "video" | "book";

export function offlineContentKind(item: OfflineDownload): OfflineContentKind {
  const hint = `${item.lessonTitle} ${item.remoteUrl} ${item.localUri} ${item.sourceType} ${item.fileName ?? ""} ${item.contentType ?? ""}`;
  if (
    item.sourceType === "pdf" ||
    (item.contentType ?? "").includes("pdf") ||
    isPdfFile(undefined, hint)
  ) {
    return "book";
  }
  return "video";
}
