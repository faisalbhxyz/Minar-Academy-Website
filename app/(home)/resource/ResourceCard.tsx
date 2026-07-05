import Image from "next/image";
import Link from "next/link";
import React from "react";
import { GoDotFill } from "react-icons/go";
import { HiOutlineArrowRight } from "react-icons/hi";

import { toBnNumber } from "@/lib/helpers";

export type ResourceCardItem = {
  id: number;
  name: string;
  sheet: number;
  link: string;
  image?: string;
  iconLabel?: string;
  iconColor?: string;
};

type SectionProps = {
  title: string;
  items: ResourceCardItem[];
  baseLink: string;
  titleLink?: string | null;
};

function ItemIcon({ item }: { item: ResourceCardItem }) {
  if (item.iconLabel && item.iconColor) {
    return (
      <div
        className="size-16 shrink-0 rounded-full flex items-center justify-center text-white text-lg font-semibold"
        style={{ backgroundColor: item.iconColor }}
      >
        {item.iconLabel}
      </div>
    );
  }

  if (item.image) {
    return (
      <Image
        src={item.image}
        alt={item.name}
        width={200}
        height={200}
        className="size-16 object-cover shrink-0 rounded-lg"
      />
    );
  }

  return (
    <div className="size-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
      {item.name.charAt(0)}
    </div>
  );
}

export default function ResourceCard({
  title,
  items,
  baseLink,
  titleLink,
}: SectionProps) {
  const heading = (
    <h2 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center gap-5 text-primary">
      {title}
      {titleLink !== null ? <HiOutlineArrowRight size={20} /> : null}
    </h2>
  );

  return (
    <div className="wrapper mb-20 pt-10 first:mt-20 first:pt-0 first:border-b first:pb-10 first:border-gray-300">
      {titleLink === null ? (
        heading
      ) : (
        <Link
          href={titleLink ?? baseLink}
          className="text-2xl md:text-3xl font-semibold mb-6 hover:text-primary flex items-center gap-5 text-primary"
        >
          {title} <HiOutlineArrowRight size={20} />
        </Link>
      )}
      <div className="grid lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${baseLink}/${item.link}`}
            className="flex items-center gap-5 border hover:border-primary p-5 rounded-lg transition-colors"
          >
            <ItemIcon item={item} />
            <div>
              <p className="text-xl font-semibold">{item.name}</p>
              <div className="flex items-center gap-2 text-gray-500">
                <GoDotFill size={10} />
                <p className="text-sm">
                  {toBnNumber(item.sheet)} টি লেকচার শীট [PDF Download]
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
