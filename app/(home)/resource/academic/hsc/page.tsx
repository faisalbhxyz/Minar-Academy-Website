import Link from "next/link";
import React from "react";
import ResourceCard from "../../ResourceCard";

const bangla = [
  {
    id: 1,
    name: "Bangla 1st Paper",
    sheet: 12,
    image: "/images/1st_paper_1741761344396.jpeg",
  },
  {
    id: 2,
    name: "Bangla 2nd Paper",
    sheet: 12,
    image: "/images/2nd_paper_1741761356238.jpeg",
  },
];

const english = [
  {
    id: 1,
    name: "English 1st Paper",
    sheet: 12,
    image: "/images/1st_paper_1741761344396.jpeg",
  },
  {
    id: 2,
    name: "English 2nd Paper",
    sheet: 12,
    image: "/images/2nd_paper_1741761356238.jpeg",
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
        <Link href="/resource/academic" className="text-primary">
          Academic Resource
        </Link>
        <span>›</span>
        <span>HSC</span>
      </div>
      <ResourceCard
        title="Bangla"
        items={bangla}
        link="/resource/academic/hsc/bangla"
      />
      <ResourceCard
        title="English"
        items={english}
        link="/resource/academic/hsc/english"
      />
    </>
  );
}
