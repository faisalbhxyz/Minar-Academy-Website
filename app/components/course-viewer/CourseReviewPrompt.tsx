"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  dismissReviewPrompt,
  isReviewPromptDismissed,
} from "@/lib/courseReview";
import { getCourseReviews } from "@/lib/courseReviewApi";

type Props = {
  courseSlug: string;
  courseTitle: string;
  accessToken: string;
  progressPercent: number;
};

export default function CourseReviewPrompt({
  courseSlug,
  courseTitle,
  accessToken,
  progressPercent,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (progressPercent < 100) return;
    if (isReviewPromptDismissed(courseSlug)) return;

    let cancelled = false;

    const check = async () => {
      const summary = await getCourseReviews(courseSlug, accessToken);
      if (cancelled) return;
      if (summary?.student_review) return;
      if (summary?.can_review === false) return;
      setVisible(true);
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [accessToken, courseSlug, progressPercent]);

  if (!visible) return null;

  const handleDismiss = () => {
    dismissReviewPrompt(courseSlug);
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              কোর্স সম্পন্ন! 🎉
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {courseTitle} — আপনার অভিজ্ঞতা শেয়ার করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href={`/user/dashboard/course-review/${courseSlug}`}
            className="rounded-xl bg-slate-800 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-900"
          >
            রেটিং ও রিভিউ দিন
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            পরে করব
          </button>
        </div>
      </div>
    </div>
  );
}
