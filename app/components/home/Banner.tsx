"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import SafeImage from "@/app/components/SafeImage";

import "swiper/css";
import "swiper/css/pagination";

export default function Banner({ banners }: { banners: Banner[] }) {
  const slides = banners ?? [];

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="px-3 pt-3">
      <div className="relative mx-auto h-[160px] w-full max-w-7xl overflow-hidden rounded-md sm:h-[220px] md:h-[420px] lg:h-[500px]">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={slides.length > 1}
          className="h-full w-full"
        >
          {slides.map((banner, index) => {
            const slide = (
              <div className="relative h-full w-full">
                <SafeImage
                  src={banner.image}
                  alt={banner.title || `Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            );

            if (!banner.url) {
              return (
                <SwiperSlide key={banner.id ?? index}>{slide}</SwiperSlide>
              );
            }

            const isExternal = /^https?:\/\//i.test(banner.url);

            return (
              <SwiperSlide key={banner.id ?? index}>
                {isExternal ? (
                  <a
                    href={banner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                  >
                    {slide}
                  </a>
                ) : (
                  <Link href={banner.url} className="block h-full w-full">
                    {slide}
                  </Link>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}
