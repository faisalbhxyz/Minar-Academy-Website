import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import { ifSessionReplaced } from "@/lib/sessionReplaced";

export class CertificateApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function requireConfig() {
  if (!publicApiBaseUrl || !publicAppKey) {
    throw new Error("App configuration is missing");
  }
}

function studentHeaders(accessToken: string): HeadersInit {
  if (!accessToken) throw new CertificateApiError("Not logged in", 401);
  return {
    "app-key": publicAppKey ?? "",
    Authorization: `Bearer ${accessToken}`,
  };
}

async function parseError(res: Response): Promise<CertificateApiError> {
  let body: { error?: string; message?: string } = {};
  try {
    body = await res.json();
  } catch {
    // HTML error page from /html route
  }
  return new CertificateApiError(
    body.message ?? body.error ?? `Request failed (${res.status})`,
    res.status
  );
}

export async function fetchStudentCertificates(
  accessToken: string
): Promise<Certificate[]> {
  requireConfig();
  const res = await fetch(`${publicApiBaseUrl}/student/certificates`, {
    headers: studentHeaders(accessToken),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (await ifSessionReplaced(res, json)) {
    throw new CertificateApiError("Session expired", 401);
  }
  if (!res.ok) throw await parseError(res);
  return (json as { data: Certificate[] }).data ?? [];
}

export async function fetchStudentCertificate(
  accessToken: string,
  certificateId: number
): Promise<Certificate> {
  requireConfig();
  const res = await fetch(
    `${publicApiBaseUrl}/student/certificates/${certificateId}`,
    {
      headers: studentHeaders(accessToken),
      cache: "no-store",
    }
  );
  const json = await res.json().catch(() => ({}));
  if (await ifSessionReplaced(res, json)) {
    throw new CertificateApiError("Session expired", 401);
  }
  if (!res.ok) throw await parseError(res);
  return (json as { data: Certificate }).data;
}

export async function fetchCourseCertificate(
  accessToken: string,
  courseSlug: string
): Promise<Certificate> {
  requireConfig();
  const res = await fetch(
    `${publicApiBaseUrl}/course/${courseSlug}/certificate`,
    {
      headers: studentHeaders(accessToken),
      cache: "no-store",
    }
  );
  const json = await res.json().catch(() => ({}));
  if (await ifSessionReplaced(res, json)) {
    throw new CertificateApiError("Session expired", 401);
  }
  if (!res.ok) throw await parseError(res);
  return (json as { data: Certificate }).data;
}

export async function getCourseCertificateOrLocked(
  accessToken: string,
  courseSlug: string
): Promise<"locked" | Certificate> {
  try {
    return await fetchCourseCertificate(accessToken, courseSlug);
  } catch (e) {
    if (e instanceof CertificateApiError && e.status === 404) return "locked";
    throw e;
  }
}

export async function fetchCertificateHTML(
  accessToken: string,
  certificateId: number
): Promise<string> {
  requireConfig();
  const res = await fetch(
    `${publicApiBaseUrl}/student/certificates/${certificateId}/html`,
    {
      headers: studentHeaders(accessToken),
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    if (await ifSessionReplaced(res, json)) {
      throw new CertificateApiError("Session expired", 401);
    }
    throw await parseError(res);
  }
  return res.text();
}

/** Auth fetch → blob → new tab (built-in Download PDF button in API HTML). */
export async function openCertificateInNewTab(
  accessToken: string,
  certificateId: number
): Promise<void> {
  const html = await fetchCertificateHTML(accessToken, certificateId);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("Pop-up blocked. Allow pop-ups for this site.");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
