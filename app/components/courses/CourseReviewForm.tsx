"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import {
  COURSE_REVIEW_TAGS,
  type CourseReviewTagId,
} from "@/lib/courseReview";
import { submitCourseReview } from "@/lib/courseReviewApi";

type Props = {
  courseSlug: string;
  courseTitle: string;
  accessToken: string;
  onSubmitted?: (review: CourseReview) => void;
  onCancel?: () => void;
  compact?: boolean;
};

export default function CourseReviewForm({
  courseSlug,
  courseTitle,
  accessToken,
  onSubmitted,
  onCancel,
  compact = false,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<CourseReviewTagId[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tagId: CourseReviewTagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("অনুগ্রহ করে স্টার রেটিং দিন।");
      return;
    }

    setSubmitting(true);
    try {
      const review = await submitCourseReview(
        courseSlug,
        {
          rating,
          comment: comment.trim() || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        },
        accessToken
      );
      if (!review) {
        throw new Error("রিভিউ জমা দেওয়া যায়নি।");
      }
      toast.success("ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।");
      onSubmitted?.(review);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "রিভিউ জমা দেওয়া যায়নি।";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={compact ? "" : "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"}>
      {!compact ? (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            আপনার মতামত লিখুন
          </h2>
          <p className="mt-1 text-sm text-gray-500">{courseTitle}</p>
        </div>
      ) : null}

      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">
          কোর্সটি কেমন লেগেছে?
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;
            const active = value <= displayRating;
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} স্টার`}
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
              >
                <Star
                  className={`h-10 w-10 ${
                    active
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between px-6 text-xs text-gray-500">
          <span>খারাপ</span>
          <span>ভালো</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {COURSE_REVIEW_TAGS.map((tag) => {
          const selected = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selected
                  ? "border-teal-700 bg-teal-50 text-teal-800"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <label
          htmlFor="course-review-comment"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          আপনার রিভিউ লিখুন (ঐচ্ছিক)
        </label>
        <textarea
          id="course-review-comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="কোর্স সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || rating < 1}
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "জমা হচ্ছে..." : "জমা দিন"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            পরে
          </button>
        ) : null}
      </div>
    </div>
  );
}
