"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export default function Banner({ banners }: { banners: Banner[] }) {
  return (
    <div className="px-3 pt-3">
      <div className="max-w-7xl mx-auto h-[150px] md:h-[500px] w-full overflow-hidden rounded-md aspect-video">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          loop
          className="h-full w-full"
        >
          {(banners ?? []).map((banner, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-full">
                <Image
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  fill
                  className="object-fill"
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
