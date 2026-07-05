"use client";

import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";
import axiosInstance from "@/lib/axiosInstance";
import ValidationErrorMsg from "../ValidationErrorMsg";

const ForgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" }),
});

type TForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TForgotPasswordSchema>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const handleOnSubmit = async (data: TForgotPasswordSchema) => {
    setLoading(true);
    setDevResetLink(null);

    const resetUrl = `${window.location.origin}/auth/reset-password`;

    try {
      const res = await axiosInstance.post("/student/forgot-password", {
        email: data.email,
        reset_url: resetUrl,
      });

      setSubmitted(true);
      toast.success(
        res.data.message ||
          "If an account exists for this email, a password reset link has been sent."
      );

      if (res.data.dev_reset_link) {
        setDevResetLink(res.data.dev_reset_link);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-sm space-y-5">
        <p className="text-xl font-semibold">ইমেইল পাঠানো হয়েছে</p>
        <p className="text-sm text-gray-600">
          যদি এই ইমেইল দিয়ে অ্যাকাউন্ট থাকে, তাহলে পাসওয়ার্ড রিসেট লিংক
          পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন।
        </p>
        {devResetLink && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-800">Dev mode reset link:</p>
            <a
              href={devResetLink}
              className="mt-1 break-all text-primary underline"
            >
              {devResetLink}
            </a>
          </div>
        )}
        <Link
          href="/auth/login"
          className="block w-full bg-gray-600 text-white p-3 rounded-md text-center"
        >
          লগইন পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="w-full max-w-sm">
      <div className="space-y-5">
        <p className="text-xl font-semibold mb-10">পাসওয়ার্ড ভুলে গেছেন?</p>
        <p className="text-sm text-gray-600 -mt-6 mb-2">
          আপনার ইমেইল দিন। পাসওয়ার্ড রিসেট করার লিংক পাঠানো হবে।
        </p>
        <input
          type="email"
          placeholder="ইমেইল"
          autoComplete="email"
          className="border w-full rounded-md p-3 outline-none focus:border-primary"
          {...register("email")}
        />
        <ValidationErrorMsg error={errors.email?.message} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-600 text-white mt-5 p-3 rounded-md flex justify-center disabled:opacity-70"
      >
        {loading ? (
          <LuLoaderCircle size={24} className="animate-spin" />
        ) : (
          "রিসেট লিংক পাঠান"
        )}
      </button>

      <div className="mt-4 flex items-center justify-center">
        <Link href="/auth/login" className="text-sm text-primary underline">
          লগইন পেজে ফিরে যান
        </Link>
      </div>
    </form>
  );
}
