import { notFound } from "next/navigation";
import React from "react";

import AcademicBreadcrumb from "@/app/components/resource/AcademicBreadcrumb";
import ResourceCard, {
  type ResourceCardItem,
} from "@/app/(home)/resource/ResourceCard";
import { fetchAcademicNoteClassDetail } from "@/lib/academicNotes";

export const revalidate = 300;

export default async function ClassNotesPage({
  params,
}: {
  params: Promise<{ classSlug: string }>;
}) {
  const { classSlug } = await params;
  const classDetail = await fetchAcademicNoteClassDetail(classSlug);

  if (!classDetail) {
    notFound();
  }

  return (
    <>
      <AcademicBreadcrumb
        crumbs={[
          { label: "Resource", href: "/resource" },
          { label: "Academic Resource", href: "/resource" },
          { label: classDetail.title },
        ]}
      />

      {classDetail.subjects.map((subject) => {
        const items: ResourceCardItem[] = subject.papers.map((paper) => ({
          id: paper.id,
          name: paper.title,
          sheet: paper.note_count,
          link: paper.slug,
          iconLabel: paper.icon_label,
          iconColor: paper.icon_color,
        }));

        return (
          <ResourceCard
            key={subject.id}
            title={subject.title}
            items={items}
            baseLink={`/resource/academic/${classSlug}/${subject.slug}`}
            titleLink={null}
          />
        );
      })}
    </>
  );
}
