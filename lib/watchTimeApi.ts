import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";

export type WatchTimeSource = "enrolled" | "free_lesson" | "offline";

export type WatchTimeEventPayload = {
  client_event_id: string;
  watched_seconds: number;
  watch_date: string;
  timezone: string;
  watched_at?: string;
  course_id?: number;
  lesson_id?: number;
  source?: WatchTimeSource;
  device_platform?: "ios" | "android" | "web";
};

export type WatchTimeAcceptData = {
  accepted: boolean;
  watch_date: string;
  day_video_seconds: number;
  duplicate: boolean;
  client_event_id?: string;
};

const MAX_SECONDS_PER_EVENT = 300;
const QUEUE_KEY = "minar_watch_time_queue_v1";

function studentHeaders(accessToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  if (publicAppKey) headers["app-key"] = publicAppKey;
  return headers;
}

export function createClientEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
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

export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readQueue(): WatchTimeEventPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WatchTimeEventPayload[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(events: WatchTimeEventPayload[]): void {
  if (typeof window === "undefined") return;
  try {
    if (events.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
      return;
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events));
  } catch {
    // Ignore quota / private mode.
  }
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
  const chunks: WatchTimeEventPayload[] = [];
  let remaining = Math.floor(params.seconds);

  while (remaining > 0) {
    const watched_seconds = Math.min(remaining, MAX_SECONDS_PER_EVENT);
    chunks.push({
      client_event_id: createClientEventId(),
      watched_seconds,
      watch_date: watchDate,
      timezone,
      watched_at: watchedAt,
      course_id: params.courseId,
      lesson_id: params.lessonId,
      source: params.source,
      device_platform: "web",
    });
    remaining -= watched_seconds;
  }

  return chunks;
}

export async function postWatchTime(
  payload: WatchTimeEventPayload,
  accessToken: string
): Promise<WatchTimeAcceptData | null> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/student/watch-time`, {
    method: "POST",
    headers: studentHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`WATCH_TIME_HTTP_${res.status}`);
  const json = await res.json().catch(() => null);
  return json?.data ?? null;
}

export async function postWatchTimeBatch(
  events: WatchTimeEventPayload[],
  accessToken: string
): Promise<void> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return;

  const res = await fetch(`${apiBase}/student/watch-time/batch`, {
    method: "POST",
    headers: studentHeaders(accessToken),
    body: JSON.stringify({ events }),
  });
  if (!res.ok) throw new Error(`WATCH_TIME_BATCH_HTTP_${res.status}`);
}

/** Flush play seconds + any offline queue. Safe to call fire-and-forget. */
export async function flushWatchSeconds(params: {
  seconds: number;
  accessToken: string;
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

  const all = [...readQueue(), ...fresh];
  if (all.length === 0) return;

  const remaining: WatchTimeEventPayload[] = [];

  for (let i = 0; i < all.length; i += 50) {
    const batch = all.slice(i, i + 50);
    try {
      if (batch.length === 1) {
        await postWatchTime(batch[0], params.accessToken);
      } else {
        await postWatchTimeBatch(batch, params.accessToken);
      }
    } catch {
      remaining.push(...all.slice(i));
      break;
    }
  }

  writeQueue(remaining);
}
