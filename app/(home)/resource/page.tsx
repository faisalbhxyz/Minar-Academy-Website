import Image from "next/image";
import Link from "next/link";
import React from "react";
import { GoDotFill } from "react-icons/go";
import { HiOutlineArrowRight } from "react-icons/hi";

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

type CourseItem = {
  id: number;
  name: string;
  sheet: number;
  image: string;
};

type SectionProps = {
  title: string;
  items: CourseItem[];
};

function Section({ title, items }: SectionProps) {
  return (
    <div className="wrapper mb-20 pt-10 first:mt-20 first:pt-0 first:border-b first:pb-10 first:border-gray-300">
      <Link
        href=""
        className="text-2xl md:text-3xl font-semibold mb-6 hover:text-primary flex items-center gap-5"
      >
        {title} <HiOutlineArrowRight size={20} className="text-primary" />
      </Link>
      <div className="grid lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href=""
            className="flex items-center gap-5 border hover:border-primary p-5 rounded-lg"
          >
            <Image
              src={item.image}
              alt="image"
              width={200}
              height={200}
              className="size-16"
            />
            <div>
              <p className="text-xl font-semibold">{item.name}</p>
              <div className="flex items-center gap-2 text-gray-500">
                <GoDotFill size={10} />
                <p className="text-sm">
                  {item.sheet} টি লেকচার শীট [PDF Download]
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Section title="একাডেমিক পড়াশোনার সবকিছু" items={academicClasses} />
      <Section title="স্কিল ডেভেলপমেন্ট এর সবকিছু" items={skills} />
      <Section title="চাকরি প্রস্তুতির সবকিছু" items={jobs} />
    </>
  );
}
