"use client";

import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import { ifSessionReplaced } from "@/lib/sessionReplaced";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;

    const apiBase = publicApiBaseUrl;
    const appKey = publicAppKey;
    if (!apiBase || !appKey) return;

    let cancelled = false;

    const verifySession = async () => {
      try {
        const res = await fetch(`${apiBase}/student/details`, {
          headers: {
            "app-key": appKey,
            Authorization: `Bearer ${session.accessToken}`,
          },
          cache: "no-store",
        });

        const json = await res.json().catch(() => ({}));
        if (cancelled) return;

        await ifSessionReplaced(res, json);
      } catch {
        // Network errors are ignored; the next API call will surface them.
      }
    };

    void verifySession();

    const onFocus = () => {
      void verifySession();
    };

    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [session?.accessToken, status]);

  return null;
}
