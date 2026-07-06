import { auth } from "@/lib/auth";
import { parseApiError } from "@/lib/parseApiError";
import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import { rebuildFormData } from "@/lib/rebuildFormData";
import { NextRequest, NextResponse } from "next/server";

const UPLOAD_TIMEOUT_MS = 60_000;

function isProfileImageField(value: FormDataEntryValue | null): value is File {
  return (
    value instanceof File &&
    value.size > 0 &&
    value.name !== "undefined" &&
    Boolean(value.type?.startsWith("image/"))
  );
}

async function forwardToBackend(
  accessToken: string,
  formData: FormData
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    return await fetch(`${publicApiBaseUrl}/student/update`, {
      method: "PUT",
      signal: controller.signal,
      headers: {
        "app-key": publicAppKey!,
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleProfileUpdate(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!publicApiBaseUrl || !publicAppKey) {
    return NextResponse.json(
      { error: "App configuration is missing" },
      { status: 500 }
    );
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const firstName = incoming.get("first_name");
  const lastName = incoming.get("last_name");
  const phone = incoming.get("phone");
  const profileImage = incoming.get("profile_image");

  if (typeof firstName !== "string" || !firstName.trim()) {
    return NextResponse.json(
      { error: "first_name is required" },
      { status: 400 }
    );
  }

  try {
    const formData = isProfileImageField(profileImage)
      ? await rebuildFormData(incoming)
      : (() => {
          const fields = new FormData();
          fields.append("first_name", firstName.trim());
          if (typeof lastName === "string") {
            fields.append("last_name", lastName.trim());
          }
          if (typeof phone === "string") {
            fields.append("phone", phone.trim());
          }
          return fields;
        })();

    const res = await forwardToBackend(session.accessToken, formData);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          ...json,
          error: parseApiError(json, "Update failed"),
          message: parseApiError(json, "Update failed"),
        },
        { status: res.status }
      );
    }

    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "আপলোড সময় শেষ হয়ে গেছে। ছোট ছবি দিয়ে আবার চেষ্টা করুন",
          message: "আপলোড সময় শেষ হয়ে গেছে। ছোট ছবি দিয়ে আবার চেষ্টা করুন",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update profile",
        message: "Failed to update profile",
      },
      { status: 502 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return handleProfileUpdate(request);
}

export async function POST(request: NextRequest) {
  return handleProfileUpdate(request);
}
