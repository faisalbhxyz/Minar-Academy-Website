import { notFound } from "next/navigation";
import React from "react";

import AcademicBreadcrumb from "@/app/components/resource/AcademicBreadcrumb";
import NoteDetail from "@/app/components/resource/NoteDetail";
import { fetchAcademicNotesByPaper } from "@/lib/academicNotes";

export const revalidate = 300;

export default async function NotePreviewPage({
  params,
}: {
  params: Promise<{
    classSlug: string;
    subjectSlug: string;
    paperSlug: string;
    noteId: string;
  }>;
}) {
  const { classSlug, subjectSlug, paperSlug, noteId } = await params;
  const data = await fetchAcademicNotesByPaper(
    classSlug,
    subjectSlug,
    paperSlug
  );

  if (!data) {
    notFound();
  }

  const note = data.notes.find((item) => String(item.id) === noteId);
  if (!note) {
    notFound();
  }

  const { class: noteClass, subject, paper } = data;
  const paperHref = `/resource/academic/${noteClass.slug}/${subject.slug}/${paper.slug}`;

  return (
    <>
      <AcademicBreadcrumb
        crumbs={[
          { label: "Resource", href: "/resource" },
          { label: "Academic Resource", href: "/resource" },
          {
            label: noteClass.title,
            href: `/resource/academic/${noteClass.slug}`,
          },
          {
            label: subject.title,
            href: paperHref,
          },
          { label: paper.title, href: paperHref },
          { label: note.title },
        ]}
      />

      <NoteDetail
        note={{
          title: note.title,
          subtitle: note.subtitle,
          pdfUrl: note.pdf_url,
          pdfFileName: note.pdf_file_name,
        }}
        meta={{
          classTitle: noteClass.title,
          subjectTitle: subject.title,
          paperTitle: paper.title,
        }}
      />
    </>
  );
}
