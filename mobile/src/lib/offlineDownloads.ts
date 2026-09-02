import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { t } from "@/i18n";
import {
  extractGoogleDriveFileId,
  extractGoogleDriveUrls,
  extractHtmlFileLinks,
  extractVimeoId,
  extractYouTubeId,
  googleDriveDirectDownloadUrl,
  isPdfFile,
  lessonResourceUrl,
  normalizeLessonResources,
} from "@/lib/format";
import type { CourseLesson, LessonSourceType } from "@/types/api";

const INDEX_KEY = "minar_offline_downloads_v1";
const DIR_NAME = "offline_lessons";

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

function localPathForLesson(lessonId: number, remoteUrl: string): string {
  const driveId = extractGoogleDriveFileId(remoteUrl);
  if (driveId) {
    return `${downloadsRoot()}lesson_${lessonId}.mp4`;
  }
  const ext = extensionFromUrl(remoteUrl);
  return `${downloadsRoot()}lesson_${lessonId}.${ext}`;
}

const VIDEO_FILE_RE = /\.(mp4|m4v|webm|mov)(\?|#|$)/i;
const DOWNLOAD_UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

function isHostedVideoFileUrl(url: string): boolean {
  const value = url.trim();
  if (!/^https?:\/\//i.test(value)) return false;
  if (VIDEO_FILE_RE.test(value)) return true;
  if (extractYouTubeId(value) || extractVimeoId(value)) return false;
  return false;
}

function isDriveVideoUrl(url: string, title = "", mime = ""): boolean {
  if (!extractGoogleDriveFileId(url)) return false;
  return !isPdfFile(mime, `${title} ${url}`);
}

function resolveRemoteDownloadUrl(url: string, confirm = "t"): string {
  const driveId = extractGoogleDriveFileId(url);
  if (driveId) return googleDriveDirectDownloadUrl(driveId, confirm);
  return url;
}

function collectLessonUrls(lesson: CourseLesson): {
  url: string;
  title: string;
  mime: string;
}[] {
  const sourceUrl = lesson.source?.data?.data ?? "";
  const rows: { url: string; title: string; mime: string }[] = [];
  if (sourceUrl) {
    rows.push({ url: sourceUrl, title: lesson.title, mime: "" });
  }
  for (const resource of normalizeLessonResources(lesson.resources)) {
    rows.push({
      url: lessonResourceUrl(resource),
      title: resource.title,
      mime: resource.mime_type ?? "",
    });
  }
  const description = lesson.description ?? "";
  for (const link of extractHtmlFileLinks(description)) {
    rows.push({ url: link.href, title: link.label, mime: "" });
  }
  for (const url of extractGoogleDriveUrls(`${sourceUrl}\n${description}`)) {
    rows.push({ url, title: lesson.title, mime: "" });
  }
  return rows.filter((row) => row.url);
}

export function isDownloadableSource(
  sourceType: LessonSourceType | string,
  sourceData: string
): boolean {
  if (Platform.OS === "web") return false;
  const url = sourceData.trim();
  if (!/^https?:\/\//i.test(url)) return false;
  if (isDriveVideoUrl(url)) return true;
  if (isHostedVideoFileUrl(url)) return true;
  if (sourceType === "youtube" || sourceType === "vimeo") return false;
  if (extractYouTubeId(url) || extractVimeoId(url)) return false;
  return sourceType === "upload";
}

export function downloadUrlForLesson(lesson: CourseLesson): string | null {
  const rows = collectLessonUrls(lesson);
  for (const row of rows) {
    if (isHostedVideoFileUrl(row.url)) return row.url;
  }
  for (const row of rows) {
    if (isDriveVideoUrl(row.url, row.title, row.mime)) return row.url;
  }
  const sourceUrl = lesson.source?.data?.data ?? "";
  if (
    isDownloadableSource(lesson.source_type, sourceUrl) &&
    !extractYouTubeId(sourceUrl) &&
    !extractVimeoId(sourceUrl)
  ) {
    return sourceUrl;
  }
  return null;
}

export function isDownloadableLesson(lesson: CourseLesson): boolean {
  return downloadUrlForLesson(lesson) !== null;
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

const activeDownloads = new Map<
  number,
  FileSystem.DownloadResumable
>();

export async function downloadLessonVideo(params: {
  lessonId: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
  lessonDescription?: string | null;
  sourceType: string;
  remoteUrl: string;
  onProgress?: (progress: number) => void;
}): Promise<OfflineDownload> {
  const canFetch =
    isDriveVideoUrl(params.remoteUrl) ||
    isDownloadableSource("upload", params.remoteUrl) ||
    isDownloadableSource(params.sourceType, params.remoteUrl);
  if (!canFetch) {
    throw new Error(t("errors.download.notSupported"));
  }
  if (activeDownloads.has(params.lessonId)) {
    throw new Error(t("errors.download.inProgress"));
  }

  await ensureDownloadsDir();
  const localUri = localPathForLesson(params.lessonId, params.remoteUrl);

  const existing = await FileSystem.getInfoAsync(localUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }

  const urlsToTry = [resolveRemoteDownloadUrl(params.remoteUrl)];
  const driveId = extractGoogleDriveFileId(params.remoteUrl);
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
      remoteUrl: params.remoteUrl,
      localUri: resultUri,
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
        Math.min(1, Math.max(0, data.totalBytesWritten / data.totalBytesExpectedToWrite))
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
  const hint = `${item.lessonTitle} ${item.remoteUrl} ${item.localUri}`;
  if (isPdfFile(undefined, hint)) return "book";
  return "video";
}
