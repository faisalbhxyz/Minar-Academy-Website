"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMiniArrowSmallRight } from "react-icons/hi2";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";
// import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import "swiper/css";
import "swiper/css/navigation";
import { courses } from "@/lib/constants";

export default function Course() {
  const allCourse = courses.filter((course) => course.category === "Board");
  return (
    <div className="wrapper py-10 mt-10 relative">
      <p className="text-center text-4xl md:text-5xl font-bold mb-10">
        অনলাইন ব্যাচে সকল কোর্সে ভর্তি চলছে!
      </p>

      {/* <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="relative"
      >
        <button className="swiper-button-prev-custom absolute left-0 top-[50%] -translate-y-1/2 z-10 p-2 bg-white/40 shadow rounded-full">
          <MdKeyboardArrowLeft size={24} />
        </button>
        <button className="swiper-button-next-custom absolute right-0 top-[50%] -translate-y-1/2 z-10 p-2 bg-white/40 shadow rounded-full">
          <MdKeyboardArrowRight size={24} />
        </button>
        {allCourse.map((course) => (
          <SwiperSlide key={course.id}>
            <div className="bg-white border rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between h-full">
              <Link href={""}>
                <Image
                  src={course.image}
                  alt={course.title}
                  width={300}
                  height={200}
                  className="w-full h-auto object-cover rounded-t-xl"
                />
              </Link>
              <div className="p-4 flex flex-col justify-between">
                <Link href="" className="text-xl font-semibold">
                  {course.title}
                </Link>
                <div className="mt-5 space-y-3">
                  <p className="text-gray-600 text-sm">
                    By {course.authorized}
                  </p>
                  <Link
                    href={""}
                    className="text-primary text-sm flex items-center"
                  >
                    বিস্তারিত <HiMiniArrowSmallRight size={22} />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper> */}
      {allCourse.map((item) => (
        <div
          key={item.id}
          className="max-w-96 mx-auto bg-white border rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between h-full"
        >
          <Link href={""}>
            <Image
              src={"/images/IMG_20250513_141238.jpg"}
              alt={"বিএস প্রশ্ন সমাধান"}
              width={300}
              height={200}
              className="w-full h-auto object-cover rounded-t-xl"
            />
          </Link>
          <div className="p-4 flex flex-col justify-between">
            <Link href="" className="text-xl font-semibold">
              English Basic Spoken Course
            </Link>
            <div className="mt-5 space-y-3">
              <p className="text-gray-600 text-sm">By আরিফুল ইসলাম মানিক</p>
              <Link
                href={`/courses/${item.id}`}
                className="text-primary text-sm flex items-center"
              >
                বিস্তারিত <HiMiniArrowSmallRight size={22} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
