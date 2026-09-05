"use client";

import React from "react";
import Link from "next/link";
import { HiMiniArrowSmallRight } from "react-icons/hi2";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import "swiper/css";
import "swiper/css/navigation";
import { useRouter } from "next/navigation";
import SafeImage from "@/app/components/SafeImage";

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
      <p className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-10 px-2">
        অনলাইন ব্যাচে ভর্তি চলছে — এখনই আপনার পছন্দের কোর্সে এনরোল করুন!
      </p>

      <div className="mb-8 -mx-2 overflow-x-auto no-scrollbar">
        <nav className="flex w-max min-w-full items-center justify-start gap-3 px-4 md:justify-center">
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
        slidesPerView={1.15}
        centeredSlides={false}
        touchStartPreventDefault={false}
        threshold={8}
        navigation={{
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="relative !overflow-visible px-1"
      >
        <button
          type="button"
          aria-label="Previous courses"
          className="swiper-button-prev-custom absolute left-0 top-[50%] z-10 hidden -translate-y-1/2 rounded-full bg-white/40 p-2 shadow md:block"
        >
          <MdKeyboardArrowLeft size={24} />
        </button>
        <button
          type="button"
          aria-label="Next courses"
          className="swiper-button-next-custom absolute right-0 top-[50%] z-10 hidden -translate-y-1/2 rounded-full bg-white/40 p-2 shadow md:block"
        >
          <MdKeyboardArrowRight size={24} />
        </button>

        {(courses ?? []).map((course) => (
          <SwiperSlide key={course.id} className="!h-auto">
            <Link
              href={`/course/${course.slug}`}
              className="bg-white border rounded-2xl shadow hover:shadow-lg transition flex flex-col h-full overflow-hidden"
            >
              <SafeImage
                src={course.featured_image}
                alt={course.title}
                width={300}
                height={200}
                className="w-full h-[200px] object-cover rounded-t-xl"
              />
              <div className="p-4 flex flex-col justify-between flex-1">
                <p className="text-lg font-semibold text-gray-800 hover:text-primary">
                  {course.title}
                </p>

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

                  <span className="text-primary text-sm flex items-center mt-3">
                    বিস্তারিত <HiMiniArrowSmallRight size={20} />
                  </span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex justify-center">
        <button
          type="button"
          className="text-white text-lg flex items-center mt-3 border border-primary px-4 py-2 rounded-full bg-primary"
          onClick={() => router.push("/courses/all")}
        >
          সকল কোর্স
        </button>
      </div>
    </div>
  );
}
