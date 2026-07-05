type ApiErrorBody = {
  error?: unknown;
  message?: unknown;
  errors?: Record<string, unknown>;
};

export function parseApiError(
  json: unknown,
  fallback = "Update failed"
): string {
  if (!json || typeof json !== "object") return fallback;

  const body = json as ApiErrorBody;

  if (typeof body.error === "string" && body.error.trim()) {
    return body.error.trim();
  }

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message.trim();
  }

  if (body.errors && typeof body.errors === "object") {
    for (const value of Object.values(body.errors)) {
      if (typeof value === "string" && value.trim()) return value.trim();
      if (Array.isArray(value)) {
        const first = value.find((item) => typeof item === "string" && item.trim());
        if (typeof first === "string") return first.trim();
      }
    }
  }

  return fallback;
}
