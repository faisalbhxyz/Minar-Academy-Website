type ApiErrorBody = {
  code?: string;
  message?: string;
  error?: string;
};

let handlingSessionReplaced = false;

export function isSessionReplaced(
  status: number,
  body: unknown
): body is ApiErrorBody {
  if (status !== 401) return false;
  const data = body as ApiErrorBody | null | undefined;
  return data?.code === "SESSION_REPLACED";
}

export async function handleSessionReplacedClient(
  message?: string
): Promise<void> {
  if (typeof window === "undefined" || handlingSessionReplaced) return;

  handlingSessionReplaced = true;

  const { signOut } = await import("next-auth/react");
  const { toast } = await import("sonner");

  toast.error(
    message ||
      "Your account was logged in on another device. Please sign in again."
  );

  try {
    await signOut({ redirect: false });
  } catch {
    // Continue with redirect even if sign-out fails.
  }

  window.location.href = "/auth/login?reason=session_replaced";
}

export async function ifSessionReplaced(
  res: Response,
  json: unknown
): Promise<boolean> {
  if (!isSessionReplaced(res.status, json)) return false;
  const data = json as ApiErrorBody;
  await handleSessionReplacedClient(data.message);
  return true;
}
