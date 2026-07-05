import { NextRequest, NextResponse } from "next/server";

import { publicApiBaseUrl } from "@/lib/publicEnv";

function isAllowedPdfHost(hostname: string): boolean {
  const trustedFragments = [
    "amazonaws.com",
    "cloudfront.net",
    "digitaloceanspaces.com",
    "minar",
    "lurnic",
  ];

  if (publicApiBaseUrl) {
    try {
      const apiHost = new URL(publicApiBaseUrl).hostname;
      if (hostname === apiHost || hostname.endsWith(`.${apiHost}`)) {
        return true;
      }
    } catch {
      // ignore invalid API base URL
    }
  }

  return trustedFragments.some((fragment) => hostname.includes(fragment));
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  if (!isAllowedPdfHost(parsed.hostname)) {
    return NextResponse.json({ error: "Forbidden host" }, { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: { Accept: "application/pdf,*/*" },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PDF" },
        { status: upstream.status }
      );
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/pdf",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 502 });
  }
}
