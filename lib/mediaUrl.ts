/**
 * Course/banner media historically used BunnyCDN (`nextrike.b-cdn.net`).
 * New uploads are on Cloudflare R2. Rewrite legacy Bunny URLs to the R2 public base
 * so the storefront serves images from R2.
 */

import { publicR2BaseUrl } from "@/lib/publicEnv";

const BUNNY_HOST_RE = /(^|\.)b-cdn\.net$/i;
const BUNNY_ALT_RE = /bunnycdn\.com$/i;

export function r2PublicBaseUrl(): string {
  return publicR2BaseUrl;
}

function isBunnyHost(hostname: string): boolean {
  return BUNNY_HOST_RE.test(hostname) || BUNNY_ALT_RE.test(hostname);
}

/**
 * Map a legacy Bunny object path to the R2 object key.
 * Bunny used `/lurnic/<file>`; R2 public URLs store `<file>` at bucket root.
 */
export function bunnyPathToR2Key(pathname: string): string {
  const cleaned = pathname.replace(/^\/+/, "");
  if (cleaned.startsWith("lurnic/")) {
    return cleaned.slice("lurnic/".length);
  }
  return cleaned;
}

export function normalizeMediaUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (!isBunnyHost(parsed.hostname)) {
      return trimmed;
    }
    const key = bunnyPathToR2Key(parsed.pathname);
    if (!key) return trimmed;
    return `${r2PublicBaseUrl()}/${key}`;
  } catch {
    return trimmed;
  }
}

/** Prefer R2 rewrite; if that fails at runtime, SafeImage can try the raw Bunny path key on R2. */
export function mediaUrlCandidates(
  url: string | null | undefined
): string[] {
  if (!url || !url.trim()) return [];
  const trimmed = url.trim();
  const primary = normalizeMediaUrl(trimmed) || trimmed;
  const out: string[] = [primary];

  try {
    const parsed = new URL(trimmed);
    if (isBunnyHost(parsed.hostname)) {
      const withPrefix = parsed.pathname.replace(/^\/+/, "");
      const withoutPrefix = bunnyPathToR2Key(parsed.pathname);
      const base = r2PublicBaseUrl();
      for (const key of [withPrefix, withoutPrefix]) {
        if (!key) continue;
        const candidate = `${base}/${key}`;
        if (!out.includes(candidate)) out.push(candidate);
      }
    }
  } catch {
    // ignore
  }

  return out;
}
