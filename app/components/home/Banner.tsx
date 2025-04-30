"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const slides = ["/images/banner.jpg", "/images/banner-2.jpg"];

export default function Banner() {
  return (
    <div className="px-3 pt-3">
      <div className="max-w-7xl mx-auto h-56 md:h-[500px] w-full overflow-hidden rounded-2xl">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          loop
          className="h-full w-full"
        >
          {slides.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-full">
                <Image
                  src={src}
                  alt={`Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
