import Image from "next/image";
import Link from "next/link";
import React from "react";
import { GoDotFill } from "react-icons/go";
import { HiOutlineArrowRight } from "react-icons/hi";

type CourseItem = {
  id: number;
  name: string;
  sheet: number;
  image: string;
};

type SectionProps = {
  title: string;
  items: CourseItem[];
  link: string;
};

export default function ResourceCard({ title, items, link }: SectionProps) {
  return (
    <div className="wrapper mb-20 pt-10 first:mt-20 first:pt-0 first:border-b first:pb-10 first:border-gray-300">
      <Link
        href={link}
        className="text-2xl md:text-3xl font-semibold mb-6 hover:text-primary flex items-center gap-5"
      >
        {title} <HiOutlineArrowRight size={20} className="text-primary" />
      </Link>
      <div className="grid lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/resource/academic/hsc`}
            className="flex items-center gap-5 border hover:border-primary p-5 rounded-lg"
          >
            <Image
              src={item.image}
              alt="image"
              width={200}
              height={200}
              className="size-16 object-cover"
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
