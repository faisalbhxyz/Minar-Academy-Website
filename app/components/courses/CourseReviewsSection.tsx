"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  formatReviewStudentName,
  renderStarRating,
} from "@/lib/courseReview";
import { getCourseReviews } from "@/lib/courseReviewApi";

type Props = {
  courseSlug: string;
  courseTitle: string;
  accessToken?: string;
  isCompleted?: boolean;
};

export default function CourseReviewsSection({
  courseSlug,
  courseTitle,
  accessToken: accessTokenProp,
  isCompleted = false,
}: Props) {
  const { data: session } = useSession();
  const accessToken = accessTokenProp ?? session?.accessToken;
  const [summary, setSummary] = useState<CourseReviewsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const data = await getCourseReviews(courseSlug, accessToken);
    setSummary(data);
    setLoading(false);
  }, [accessToken, courseSlug]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const reviews = summary?.reviews ?? [];
  const canReview =
    Boolean(accessToken) &&
    (summary?.can_review || (isCompleted && !summary?.student_review));
  const averageRating = summary?.average_rating ?? 0;
  const totalReviews = summary?.total_reviews ?? reviews.length;

  return (
    <div className="mt-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-3xl font-semibold text-gray-900">স্টুডেন্ট রিভিউ</p>
          {totalReviews > 0 ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-amber-500 text-lg">
                {renderStarRating(Math.round(averageRating))}
              </span>
              <span>
                {averageRating.toFixed(1)} ({totalReviews} রিভিউ)
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              এখনও কোনো রিভিউ নেই।
            </p>
          )}
        </div>
        {canReview ? (
          <Link
            href={`/user/dashboard/course-review/${courseSlug}`}
            className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-900"
          >
            রিভিউ দিন
          </Link>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">রিভিউ লোড হচ্ছে...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            {canReview
              ? `${courseTitle} সম্পন্ন করেছেন — প্রথম রিভিউ দিন!`
              : "এই কোর্সে এখনও কেউ রিভিউ দেননি।"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            const studentName = formatReviewStudentName(
              review.student?.first_name,
              review.student?.last_name
            );
            const avatar = review.student?.profile_image || "/images/profile.png";

            return (
              <div
                key={review.id}
                className="rounded-xl bg-gray-100 p-6 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={avatar}
                    alt={studentName}
                    width={64}
                    height={64}
                    className="mb-4 h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-medium">{studentName}</h3>
                    <div className="mb-2 flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment ? (
                  <p className="line-clamp-4 text-gray-700">{review.comment}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    কোনো লিখিত মতামত নেই।
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
