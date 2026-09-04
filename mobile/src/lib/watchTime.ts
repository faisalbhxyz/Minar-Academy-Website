import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import * as api from "@/api";
import { localDateKey } from "@/store/learningStore";
import type { WatchTimeEventPayload } from "@/types/api";

const QUEUE_KEY = "minar_watch_time_queue_v1";
const MAX_SECONDS_PER_EVENT = 300;
const MAX_BATCH = 50;

export type WatchTimeSource = "enrolled" | "free_lesson" | "offline";

export function createClientEventId(): string {
  const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka";
  } catch {
    return "Asia/Dhaka";
  }
}

export function devicePlatform(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

async function readQueue(): Promise<WatchTimeEventPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WatchTimeEventPayload[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(events: WatchTimeEventPayload[]): Promise<void> {
  if (events.length === 0) {
    await AsyncStorage.removeItem(QUEUE_KEY);
    return;
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(events));
}

function chunkSeconds(total: number): number[] {
  const chunks: number[] = [];
  let remaining = Math.floor(total);
  while (remaining > 0) {
    const chunk = Math.min(remaining, MAX_SECONDS_PER_EVENT);
    chunks.push(chunk);
    remaining -= chunk;
  }
  return chunks;
}

function buildEvents(params: {
  seconds: number;
  courseId?: number;
  lessonId?: number;
  source: WatchTimeSource;
}): WatchTimeEventPayload[] {
  const timezone = deviceTimezone();
  const watchDate = localDateKey();
  const watchedAt = new Date().toISOString();
  const platform = devicePlatform();

  return chunkSeconds(params.seconds).map((watched_seconds) => ({
    client_event_id: createClientEventId(),
    watched_seconds,
    watch_date: watchDate,
    timezone,
    watched_at: watchedAt,
    course_id: params.courseId,
    lesson_id: params.lessonId,
    source: params.source,
    device_platform: platform,
  }));
}

/** Flush seconds to API; queue offline on failure. Also drains prior queue. */
export async function flushWatchSeconds(params: {
  seconds: number;
  courseId?: number;
  lessonId?: number;
  source?: WatchTimeSource;
}): Promise<void> {
  const source = params.source ?? "enrolled";
  const fresh =
    params.seconds > 0
      ? buildEvents({
          seconds: params.seconds,
          courseId: params.courseId,
          lessonId: params.lessonId,
          source,
        })
      : [];

  const queued = await readQueue();
  const all = [...queued, ...fresh];
  if (all.length === 0) return;

  const remaining: WatchTimeEventPayload[] = [];

  for (let i = 0; i < all.length; i += MAX_BATCH) {
    const batch = all.slice(i, i + MAX_BATCH);
    try {
      if (batch.length === 1) {
        await api.postWatchTime(batch[0]);
      } else {
        await api.postWatchTimeBatch(batch);
      }
    } catch {
      remaining.push(...all.slice(i));
      break;
    }
  }

  await writeQueue(remaining);
}

export async function flushPendingWatchQueue(): Promise<void> {
  await flushWatchSeconds({ seconds: 0 });
}
