import { t } from "@/i18n";
import { apiBaseUrl } from "@/lib/env";
import type { LessonResource } from "@/types/api";

export function formatPrice(
  pricingModel: "free" | "paid",
  sale?: number | null,
  regular?: number | null
): string {
  if (pricingModel === "free") return t("courses.price.free");
  const price = sale ?? regular;
  if (price == null) return t("courses.price.paid");
  return `৳${Number(price).toLocaleString("en-BD")}`;
}

export function fullName(
  first?: string | null,
  last?: string | null
): string {
  return [first, last].filter(Boolean).join(" ").trim() || t("common.student");
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

export function toBengaliNumerals(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
}

/** LinkedIn-style: "Mar 21, 2024 at 05:43PM UTC" */
export function formatCertificateIssuedAt(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;

  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  let hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hh = String(hours).padStart(2, "0");

  return `${month} ${day}, ${year} at ${hh}:${minutes}${ampm} UTC`;
}

export function lessonCount(chapters?: { course_lessons?: unknown[] }[]): number {
  if (!chapters?.length) return 0;
  return chapters.reduce(
    (sum, ch) => sum + (ch.course_lessons?.length ?? 0),
    0
  );
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function absoluteMediaUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  const origin = apiBaseUrl.replace(/\/v1\/?$/i, "");
  return `${origin}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function normalizeLessonResources(
  raw: LessonResource[] | Record<string, string> | null | undefined
): LessonResource[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((item) => Boolean(item.file_path || item.url));
  return Object.entries(raw).map(([title, filePath], index) => ({
    id: index,
    mime_type: isPdfFile(undefined, `${title} ${filePath}`)
      ? "application/pdf"
      : "application/octet-stream",
    title,
    file_path: filePath,
  }));
}

export function lessonResourceUrl(resource: LessonResource): string {
  return absoluteMediaUrl(resource.file_path || resource.url || "");
}

export function isPdfFile(mimeType: string | undefined, urlOrName: string): boolean {
  const mime = (mimeType ?? "").toLowerCase();
  const name = urlOrName.toLowerCase();
  return mime.includes("pdf") || /\.pdf(\?|#|$)/i.test(name);
}

export function extractHtmlFileLinks(
  html: string
): { href: string; label: string }[] {
  if (!html.includes("<a")) return [];
  const links: { href: string; label: string }[] = [];
  const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match = re.exec(html);
  while (match) {
    const href = absoluteMediaUrl(match[1] ?? "");
    if (href) {
      const label =
        stripHtml(match[2] ?? "") ||
        decodeURIComponent(href.split("/").pop()?.split("?")[0] ?? t("common.file"));
      links.push({ href, label });
    }
    match = re.exec(html);
  }
  return links;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function extractVimeoId(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const match = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (match?.[1]) return match[1];
  if (/^\d{6,12}$/.test(value)) return value;
  return null;
}

export function extractGoogleDriveFileId(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
    /drive\.google\.com\/open\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/i,
    /drive\.google\.com\/uc\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/i,
    /docs\.google\.com\/uc\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/i,
    /drive\.usercontent\.google\.com\/(?:u\/\d+\/)?download\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function isGoogleDriveUrl(raw: string): boolean {
  return Boolean(extractGoogleDriveFileId(raw));
}

export function sameMediaUrl(a: string, b: string): boolean {
  const left = a.trim();
  const right = b.trim();
  if (!left || !right) return false;
  if (left === right) return true;
  const idA = extractGoogleDriveFileId(left);
  const idB = extractGoogleDriveFileId(right);
  return Boolean(idA && idB && idA === idB);
}

export function googleDriveDirectDownloadUrl(
  fileId: string,
  confirm = "t"
): string {
  const query = new URLSearchParams({
    id: fileId,
    export: "download",
    confirm,
  });
  return `https://drive.usercontent.google.com/download?${query.toString()}`;
}

export function extractGoogleDriveUrls(text: string): string[] {
  if (!text) return [];
  const matches =
    text.match(
      /https?:\/\/(?:drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com)\/[^\s"'<>\\]+/gi
    ) ?? [];
  const unique: string[] = [];
  for (const raw of matches) {
    const cleaned = raw.replace(/[.,;)\]]+$/g, "");
    if (!extractGoogleDriveFileId(cleaned)) continue;
    if (!unique.includes(cleaned)) unique.push(cleaned);
  }
  return unique;
}

export function extractYouTubeId(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
    /src=["'](?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  return null;
}

export function youtubeEmbedUrl(raw: string): string | null {
  const id = extractYouTubeId(raw);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1&controls=0&fs=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&showinfo=0`;
}

/** HTML player — fixes YouTube Error 153 in Android WebView (needs Referer/origin). */
export function youtubePlayerHtml(raw: string): string | null {
  const id = extractYouTubeId(raw);
  if (!id) return null;

  const src = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1&controls=0&fs=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&showinfo=0`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
      .wrap { position: fixed; inset: 0; overflow: hidden; }
      iframe {
        position: absolute; left: 0; top: -6%;
        width: 100%; height: 112%; border: 0; pointer-events: none;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <iframe
        src="${src}"
        title="YouTube"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
  </body>
</html>`;
}


export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            error?: string | Record<string, string[] | string>;
            errors?: Record<string, string[] | string>;
          };
        };
      }
    ).response;
    const data = response?.data;
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }
    const nested = data?.errors ?? data?.error;
    if (nested && typeof nested === "object") {
      const parts = Object.values(nested).flatMap((value) =>
        Array.isArray(value) ? value : [String(value)]
      );
      if (parts.length) return parts.join("\n");
    }
    if (response?.status === 401 || response?.status === 403) {
      return t("errors.unauthorized");
    }
    if (response?.status && response.status >= 500) {
      return t("errors.server");
    }
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: string }).message ?? "");
    const code =
      "code" in error ? String((error as { code?: string }).code ?? "") : "";

    if (
      code === "ECONNABORTED" ||
      message.toLowerCase().includes("timeout")
    ) {
      return t("errors.timeout");
    }

    if (
      code === "ERR_NETWORK" ||
      message.toLowerCase().includes("network error")
    ) {
      return t("errors.network");
    }

    if (message) return message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}


