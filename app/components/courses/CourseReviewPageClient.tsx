"use client";

import { useRouter } from "next/navigation";
import CourseReviewForm from "@/app/components/courses/CourseReviewForm";

type Props = {
  courseSlug: string;
  courseTitle: string;
  accessToken: string;
};

export default function CourseReviewPageClient({
  courseSlug,
  courseTitle,
  accessToken,
}: Props) {
  const router = useRouter();

  return (
    <CourseReviewForm
      courseSlug={courseSlug}
      courseTitle={courseTitle}
      accessToken={accessToken}
      onSubmitted={() => router.push(`/user/course/${courseSlug}`)}
      onCancel={() => router.push(`/user/course/${courseSlug}`)}
    />
  );
}
