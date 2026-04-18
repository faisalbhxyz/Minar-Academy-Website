/**
 * NEXT_PUBLIC_* values are inlined at build time. Vercel/dashboard copy-paste often adds
 * stray quotes or whitespace — normalize so axios and headers stay valid.
 */
export function normalizePublicEnvValue(
  value: string | undefined
): string | undefined {
  if (value === undefined) return undefined;
  let v = String(value).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v.length > 0 ? v : undefined;
}

/**
 * Axios requires `baseURL` to be an absolute URL. Dashboard copy-paste often omits `https://`.
 */
export function ensureAbsoluteApiBaseUrl(
  raw: string | undefined
): string | undefined {
  const n = normalizePublicEnvValue(raw);
  if (!n) return undefined;
  if (/^https?:\/\//i.test(n)) return n.replace(/\/+$/, "");
  return `https://${n.replace(/^\/+/, "")}`.replace(/\/+$/, "");
}

export const publicApiBaseUrl = ensureAbsoluteApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL
);

export const publicAppKey = normalizePublicEnvValue(
  process.env.NEXT_PUBLIC_APP_KEY
);
