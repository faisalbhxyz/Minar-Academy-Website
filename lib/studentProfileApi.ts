import { parseApiError } from "@/lib/parseApiError";
import { ifSessionReplaced } from "@/lib/sessionReplaced";

export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_IMAGE_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

const PROFILE_UPDATE_TIMEOUT_MS = 65_000;

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

  let res: Response;
  try {
    res = await fetch("/api/student/profile", {
      method: "PUT",
      body: formData,
      signal: AbortSignal.timeout(PROFILE_UPDATE_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        ok: false,
        error: "আপলোড সময় শেষ হয়ে গেছে। ছোট ছবি দিয়ে আবার চেষ্টা করুন",
      };
    }

    return {
      ok: false,
      error: "নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন",
    };
  }

  const json = await res.json().catch(() => ({}));

  if (await ifSessionReplaced(res, json)) {
    return { ok: false, error: "", sessionReplaced: true };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: parseApiError(json, "প্রোফাইল আপডেট ব্যর্থ হয়েছে"),
    };
  }

  return {
    ok: true,
    message: json.message || "Profile updated successfully",
    data: json.data,
  };
}
