import { notFound } from "next/navigation";
import React from "react";

import SubjectCard from "@/app/(home)/resource/SubjectCard";
import AcademicBreadcrumb from "@/app/components/resource/AcademicBreadcrumb";
import { fetchAcademicNotesByPaper } from "@/lib/academicNotes";

export const revalidate = 300;

export default async function PaperNotesPage({
  params,
}: {
  params: Promise<{
    classSlug: string;
    subjectSlug: string;
    paperSlug: string;
  }>;
}) {
  const { classSlug, subjectSlug, paperSlug } = await params;
  const data = await fetchAcademicNotesByPaper(
    classSlug,
    subjectSlug,
    paperSlug
  );

  if (!data) {
    notFound();
  }

  const { class: noteClass, subject, paper, notes } = data;

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
          },
          { label: paper.title },
        ]}
      />

      <div className="wrapper py-10">
        {notes.length === 0 ? (
          <p className="text-gray-500 py-10 text-center">
            এই পেপারে এখনো কোনো লেকচার শীট যোগ করা হয়নি।
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {notes.map((note) => (
              <SubjectCard
                key={note.id}
                note={{
                  id: note.id,
                  title: note.title,
                  subtitle: note.subtitle,
                  thumbnail: note.thumbnail,
                  pdfUrl: note.pdf_url,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
