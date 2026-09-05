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
  const { setItem } = useOrderStore();
  const overview = Array.isArray(course?.overview) ? course.overview : [];

  const handlePurchase = (courseItem: CourseDetails | null) => {
    if (courseItem == null) return;
    setItem({
      id: courseItem.id,
      title: courseItem.title,
      featured_image: courseItem.featured_image,
      pricing_model: courseItem.pricing_model,
      regular_price: courseItem.regular_price,
      sale_price: courseItem.sale_price,
    });
    router.push("/checkout");
  };

  return (
    <div className="p-5 border rounded-xl sticky top-20">
      <p className="text-xl">{course?.title}</p>
      {overview.length > 0 ? (
        <>
          <p className="text-base font-semibold mt-5 mb-3">
            কী কী থাকছে এই কোর্সে
          </p>
          <ul className="space-y-4">
            {overview.map((path: string, idx: number) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="border w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <p>{path}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
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
        <button type="button" className="px-6 py-2 text-white bg-primary rounded">
          Apply
        </button>
      </div>
      <button
        type="button"
        className="w-full px-6 py-2 bg-secondary text-white rounded"
        onClick={() => handlePurchase(course ?? null)}
      >
        এনরোল করুন
      </button>
    </div>
  );
}
