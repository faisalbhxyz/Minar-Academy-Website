import Image from "next/image";
import React from "react";
import SeeMore from "./SeeMore";

const studentReviews = [
  {
    id: 1,
    image: "/images/profile.png",
    name: "Sajib",
    batch: "batch 1",
    rating: 5,
    comment:
      "The Data Analytics and Business Intelligence course at Interactive Cares has been an exceptional learning experience.",
  },
  {
    id: 2,
    image: "/images/profile.png",
    name: "Sajib",
    batch: "batch 1",
    rating: 5,
    comment:
      "The Data Analytics and Business Intelligence course at Interactive Cares has been an exceptional learning experience.",
  },
  {
    id: 3,
    image: "/images/profile.png",
    name: "Sajib",
    batch: "batch 1",
    rating: 5,
    comment:
      "The Data Analytics and Business Intelligence course at Interactive Cares has been an exceptional learning experience.",
  },
];

function StudentReview() {
  return (
    <div className="mt-10">
      <p className="text-3xl font-semibold text-center mb-8">স্টুডেন্ট রিভিউ</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studentReviews.map((review) => (
          <div key={review.id} className="bg-gray-100 shadow-md rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Image
                src={review.image}
                alt={review.name}
                width={100}
                height={100}
                className="w-16 h-16 rounded-full mb-4"
              />
              <div>
                <h3 className="text-xl font-medium">{review.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{review.batch}</p>
                <div className="text-yellow-500 mb-2 text-2xl">
                  {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                </div>
              </div>
            </div>
            <p className="text-gray-700 line-clamp-3">{review.comment}</p>
            <SeeMore />
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentReview;
