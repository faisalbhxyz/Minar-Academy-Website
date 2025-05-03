import Link from "next/link";
import React from "react";
import ResourceCard from "../ResourceCard";

const preliCourse = [
  {
    id: 1,
    name: "বাংলা ভাষা ও সাহিত্য",
    sheet: 12,
    image: "/images/icon_bn1.jpeg",
  },
  {
    id: 2,
    name: "গাণিতিক যুক্তি",
    sheet: 12,
    image: "/images/icon_gm.jpeg",
  },
  {
    id: 3,
    name: "বাংলাদেশ বিষয়াবলি",
    sheet: 12,
    image: "/images/icon_civics.jpeg",
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
        title="বিসিএস প্রিলি কোর্স"
        items={preliCourse}
        link="/resource/academic/hsc"
      />
    </>
  );
}
