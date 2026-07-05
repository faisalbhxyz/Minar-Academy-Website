"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMiniArrowSmallRight } from "react-icons/hi2";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import "swiper/css";
import "swiper/css/navigation";
import CoursesMenu from "@/app/(home)/courses/CoursesMenu";
import { useRouter } from "next/navigation";

export default function Course({
  courses,
  categories,
}: {
  courses: CourseDetails[];
  categories: Category[];
}) {
  const router = useRouter();

  return (
    <div className="wrapper py-10 mt-0 md:mt-10 relative">
      <p className="text-center text-4xl md:text-5xl font-bold mb-10">
        অনলাইন ব্যাচে ভর্তি চলছে — এখনই আপনার পছন্দের কোর্সে এনরোল করুন!
      </p>

      <div className="mb-8 overflow-x-auto no-scrollbar">
        <nav className="flex items-center justify-center gap-3 px-2">
          {(categories ?? []).map((category) => (
            <Link
              key={category.id}
              href={`/courses/category/${category.slug}`}
              className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-primary hover:text-white transition"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>

      <Swiper
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

        {(courses ?? []).map((course) => (
          <SwiperSlide key={course.id}>
            <div className="bg-white border rounded-2xl shadow hover:shadow-lg transition flex flex-col h-full overflow-hidden">
              <Link href={`/course/${course.slug}`}>
                <Image
                  src={course.featured_image || "/images/placeholder.svg"}
                  alt={course.title}
                  width={300}
                  height={200}
                  className="w-full h-[200px] object-cover rounded-t-xl"
                />
              </Link>
              <div className="p-4 flex flex-col justify-between h-full">
                <Link
                  href={`/course/${course.slug}`}
                  className="text-lg font-semibold text-gray-800 hover:text-primary"
                >
                  {course.title}
                </Link>

                <div className="mt-3">
                  {course.regular_price === 0 ? (
                    <span className="text-lg font-bold text-green-600">
                      ফ্রি
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {course.sale_price ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            ৳{course.sale_price}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ৳{course.regular_price}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-800">
                          ৳{course.regular_price}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/course/${course.slug}`}
                    className="text-primary text-sm flex items-center mt-3"
                  >
                    বিস্তারিত <HiMiniArrowSmallRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex justify-center">
        <button
          className="text-white text-lg flex items-center mt-3 border border-primary px-4 py-2 rounded-full bg-primary"
          onClick={() => router.push("/courses/all")}
        >
          সকল কোর্স
        </button>
      </div>
    </div>
  );
}
