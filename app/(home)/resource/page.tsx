import Image from "next/image";
import Link from "next/link";
import React from "react";
import { GoDotFill } from "react-icons/go";
import { HiOutlineArrowRight } from "react-icons/hi";
import ResourceCard from "./ResourceCard";

const academicClasses = [
  {
    id: 1,
    name: "HSC",
    sheet: 88,
    image: "/images/HSC_1741760933388.jpeg",
  },
  {
    id: 2,
    name: "৯ম-১০ম শ্রেণি",
    sheet: 44,
    image: "/images/icon_ssc.jpeg",
  },
  {
    id: 3,
    name: "৮ম শ্রেণি",
    sheet: 51,
    image: "/images/icon_class8.jpeg",
  },
  {
    id: 4,
    name: "৭ম শ্রেণি",
    sheet: 51,
    image: "/images/icon_class7.jpeg",
  },
  {
    id: 5,
    name: "৬ষ্ঠ শ্রেণি",
    sheet: 21,
    image: "/images/icon_class6.jpeg",
  },
];

const skills = [
  {
    id: 1,
    name: "English Free Resource",
    sheet: 33,
    image: "/images/icon_english.jpeg",
  },
  {
    id: 2,
    name: "Skills & IT Courses",
    sheet: 9,
    image: "/images/icon_entre.jpeg",
  },
  {
    id: 3,
    name: "Freelancing Courses",
    sheet: 5,
    image: "/images/cat_icon_freelancing.jpeg",
  },
  {
    id: 4,
    name: "Kids' Courses (Age 7-14)",
    sheet: 3,
    image: "/images/cat_icon_kids_courses.jpeg",
  },
];

const jobs = [
  {
    id: 1,
    name: "বিসিএস প্রিলি কোর্স",
    sheet: 12,
    image: "/images/bcs-preli-live-course-1_1.jpg",
  },
];

export default function Page() {
  return (
    <>
      <ResourceCard
        title="একাডেমিক পড়াশোনার সবকিছু"
        items={academicClasses}
        link="/resource/academic"
      />
      <ResourceCard
        title="স্কিল ডেভেলপমেন্ট এর সবকিছু"
        items={skills}
        link="/resource/skills"
      />
      <ResourceCard
        title="চাকরি প্রস্তুতির সবকিছু"
        items={jobs}
        link="/resource/jobs"
      />
    </>
  );
}
