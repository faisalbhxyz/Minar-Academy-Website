import axiosInstance from "@/lib/axiosInstance";

export async function fetchAcademicNoteClasses(): Promise<AcademicNoteClass[]> {
  try {
    const res = await axiosInstance.get("/academic-notes");
    return res.data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch academic note classes:", error);
    return [];
  }
}

export async function fetchAcademicNoteClassDetail(
  classSlug: string
): Promise<AcademicNoteClassDetail | null> {
  try {
    const res = await axiosInstance.get(`/academic-notes/${classSlug}`);
    return res.data.data ?? null;
  } catch (error) {
    console.error(`Failed to fetch class "${classSlug}":`, error);
    return null;
  }
}

export async function fetchAcademicNotesByPaper(
  classSlug: string,
  subjectSlug: string,
  paperSlug: string
): Promise<AcademicNotePaperDetail | null> {
  try {
    const res = await axiosInstance.get(
      `/academic-notes/${classSlug}/${subjectSlug}/${paperSlug}`
    );
    return res.data.data ?? null;
  } catch (error) {
    console.error(
      `Failed to fetch notes for ${classSlug}/${subjectSlug}/${paperSlug}:`,
      error
    );
    return null;
  }
}
