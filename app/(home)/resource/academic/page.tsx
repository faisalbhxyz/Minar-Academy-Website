import Link from "next/link";
import React from "react";
import ResourceCard from "../ResourceCard";

const hscSubjects = [
  {
    id: 1,
    name: "Biology",
    link: "",
    sheet: 12,
    image: "/images/Biology_1741761052406.jpeg",
  },
  {
    id: 2,
    name: "Higher Math",
    link: "",
    sheet: 12,
    image: "/images/HM_1741761398850.jpeg",
  },
  {
    id: 3,
    name: "Chemistry",
    link: "",
    sheet: 12,
    image: "/images/HM_1741761398850.jpeg",
  },
];
const nineTen = [
  {
    id: 2,
    name: "সাধারণ গণিত",
    link: "",
    sheet: 12,
    image: "/images/HM_1741761398850.jpeg",
  },
];
const eight = [
  {
    id: 2,
    name: "গণিত",
    link: "",
    sheet: 12,
    image: "/images/HM_1741761398850.jpeg",
  },
];
const seven = [
  {
    id: 2,
    name: "গণিত",
    link: "",
    sheet: 12,
    image: "/images/HM_1741761398850.jpeg",
  },
];
const six = [
  {
    id: 2,
    name: "গণিত",
    link: "",
    sheet: 12,
    image: "/images/HM_1741761398850.jpeg",
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
        <span>Academic Resources</span>
      </div>
      <ResourceCard
        title="HSC"
        items={hscSubjects}
        link="/resource/academic/hsc"
      />
      <ResourceCard
        title="৯ম-১০ম শ্রেণি"
        items={nineTen}
        link="/resource/academic/9-10"
      />
      <ResourceCard
        title="৮ম শ্রেণি"
        items={eight}
        link="/resource/academic/c8"
      />
      <ResourceCard
        title="৭ম শ্রেণি"
        items={seven}
        link="/resource/academic/c7"
      />
      <ResourceCard
        title="৬ষ্ঠ শ্রেণি"
        items={six}
        link="/resource/academic/c6"
      />
    </>
  );
}
