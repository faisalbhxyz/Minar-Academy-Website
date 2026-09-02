import { API_BASE_URL, APP_KEY } from "@/lib/config";

function ensureAbsoluteApiBaseUrl(raw: string | undefined): string {
  const n = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  const candidate = !n
    ? API_BASE_URL
    : /^https?:\/\//i.test(n)
      ? n.replace(/\/+$/, "")
      : `https://${n.replace(/^\/+/, "")}`.replace(/\/+$/, "");

  // Never allow cleartext HTTP to the API (tokens travel on this channel).
  if (!candidate.toLowerCase().startsWith("https://")) {
    return API_BASE_URL;
  }
  return candidate;
}

function resolveAppKey(raw: string | undefined): string {
  const fromEnv = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  return fromEnv || APP_KEY;
}

export const apiBaseUrl = ensureAbsoluteApiBaseUrl(
  process.env.EXPO_PUBLIC_API_URL
);

export const appKey = resolveAppKey(process.env.EXPO_PUBLIC_APP_KEY);
