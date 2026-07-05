import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import { ifSessionReplaced } from "@/lib/sessionReplaced";

export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_IMAGE_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

export type StudentProfileUpdateFields = {
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  profile_image?: File | null;
};

type UpdateSuccess = {
  ok: true;
  message: string;
  data: Student;
};

type UpdateFailure = {
  ok: false;
  error: string;
  sessionReplaced?: boolean;
};

export type StudentProfileUpdateResult = UpdateSuccess | UpdateFailure;

export async function updateStudentProfile(
  accessToken: string | undefined,
  fields: StudentProfileUpdateFields
): Promise<StudentProfileUpdateResult> {
  if (!accessToken) {
    return { ok: false, error: "Please sign in again" };
  }

  if (!publicApiBaseUrl || !publicAppKey) {
    return { ok: false, error: "App configuration is missing" };
  }

  const formData = new FormData();
  formData.append("first_name", fields.first_name);
  if (fields.last_name !== undefined && fields.last_name !== null) {
    formData.append("last_name", fields.last_name);
  }
  if (fields.phone !== undefined && fields.phone !== null) {
    formData.append("phone", fields.phone);
  }
  if (fields.profile_image) {
    formData.append("profile_image", fields.profile_image);
  }

  const res = await fetch(`${publicApiBaseUrl}/student/update`, {
    method: "PUT",
    headers: {
      "app-key": publicAppKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const json = await res.json().catch(() => ({}));

  if (await ifSessionReplaced(res, json)) {
    return { ok: false, error: "", sessionReplaced: true };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: json.error || json.message || "Update failed",
    };
  }

  return {
    ok: true,
    message: json.message || "Profile updated successfully",
    data: json.data,
  };
}
