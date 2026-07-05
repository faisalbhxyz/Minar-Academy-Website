import useAppStore from "@/hooks/useAppStore";
import useOrderStore from "@/hooks/useOrderStore";
import { useRouter } from "next/navigation";
import React from "react";

export default function ProgramPath({
  course,
}: {
  course: CourseDetails | undefined;
}) {
  const router = useRouter();
  const { isVideoPlay, toggleVideoPlay } = useAppStore();
  const { setItem } = useOrderStore();

  const handlePurchase = (course: CourseDetails | null) => {
    if (course == null) return;
    setItem({
      id: course.id,
      title: course.title,
      featured_image: course.featured_image,
      pricing_model: course.pricing_model,
      regular_price: course.regular_price,
      sale_price: course.sale_price,
    });
    router.push("/checkout");
  };

  return (
    <>
      <div className="p-5 border rounded-xl sticky top-20">
        <p className="text-xl">{course?.title}</p>
        <p className="text-base font-semibold mt-5 mb-3">
          কী কী থাকছে এই কোর্সে
        </p>
        <ul className="space-y-4">
          {course?.overview.map((path: string, idx: number) => (
            <li key={idx} className="flex items-center gap-3">
              <div className="border w-6 h-6 rounded-full flex items-center justify-center">
                {idx + 1}
              </div>
              <p>{path}</p>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 mt-5">
          <p className="text-3xl font-semibold">৳{course?.sale_price}</p>
          <p className="line-through text-xl text-gray-500">
            ৳{course?.regular_price}
          </p>
        </div>
        <div className="flex items-center gap-3 h-10 my-3">
          <input
            type="text"
            placeholder="Apply Promo"
            className="border w-full h-full rounded-md px-3"
          />
          <button className=" px-6 py-2 text-white bg-primary rounded">
            Apply
          </button>
        </div>
        <button
          className="w-full px-6 py-2 bg-secondary text-white rounded"
          onClick={() => handlePurchase(course ?? null)}
        >
          এনরোল করুন
        </button>
        {/* <button
          onClick={toggleVideoPlay}
          className="w-full px-6 py-2 border border-gray-800 text-gray-800 rounded mt-3"
        >
          {isVideoPlay ? "Watching..." : "Watch Demo Video"}
        </button> */}
      </div>
    </>
  );
}
