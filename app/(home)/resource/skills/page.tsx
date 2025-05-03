import Link from "next/link";
import React from "react";
import ResourceCard from "../ResourceCard";

const hscSubjects = [
  {
    id: 1,
    name: "Grammar",
    sheet: 12,
    image:
      "/images/chakrijibider-jonno-english-course-thumbnail-by-munzereen-shahid-16x9.jpg",
  },
  {
    id: 2,
    name: "Vocabulary",
    sheet: 12,
    image:
      "/images/chakrijibider-jonno-english-course-thumbnail-by-munzereen-shahid-16x9.jpg",
  },
  {
    id: 3,
    name: "Phrases",
    sheet: 12,
    image:
      "/images/chakrijibider-jonno-english-course-thumbnail-by-munzereen-shahid-16x9.jpg",
  },
];

export default function page() {
  return (
    <>
      <div className="wrapper flex gap-2 py-3">
        <Link href="/resource" className="text-primary">
          Resource
        </Link>
        <span>›</span>
        <span>Skills Resources</span>
      </div>
      <ResourceCard
        title="English Free Resource"
        items={hscSubjects}
        link="/resource/skills/language-learning"
      />
    </>
  );
}
