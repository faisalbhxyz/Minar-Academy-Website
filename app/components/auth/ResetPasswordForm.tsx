"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LuLoaderCircle, LuEye, LuEyeOff } from "react-icons/lu";
import axiosInstance from "@/lib/axiosInstance";
import ValidationErrorMsg from "../ValidationErrorMsg";

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(1, { message: "Password is required." })
      .min(6, { message: "Password must be at least 6 characters" }),
    confirm_password: z
      .string()
      .trim()
      .min(1, { message: "Password is required." })
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type TResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TResetPasswordSchema>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  if (!token || !email) {
    return (
      <div className="w-full max-w-sm space-y-5">
        <p className="text-xl font-semibold">লিংকটি সঠিক নয়</p>
        <p className="text-sm text-gray-600">
          পাসওয়ার্ড রিসেট লিংকটি অসম্পূর্ণ বা মেয়াদোত্তীর্ণ। আবার চেষ্টা
          করুন।
        </p>
        <Link
          href="/auth/forgot-password"
          className="block w-full bg-gray-600 text-white p-3 rounded-md text-center"
        >
          নতুন রিসেট লিংক চান
        </Link>
      </div>
    );
  }

  const handleOnSubmit = async (data: TResetPasswordSchema) => {
    setLoading(true);

    try {
      const res = await axiosInstance.post("/student/reset-password", {
        email,
        token,
        password: data.password,
      });

      toast.success(res.data.message || "Password updated successfully");
      router.push("/auth/login");
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

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="w-full max-w-sm">
      <div className="space-y-5">
        <p className="text-xl font-semibold mb-10">নতুন পাসওয়ার্ড সেট করুন</p>
        <p className="text-sm text-gray-600 -mt-6 mb-2">{email}</p>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="নতুন পাসওয়ার্ড"
            autoComplete="new-password"
            className="border w-full rounded-md p-3 pr-11 outline-none focus:border-primary"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          >
            {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
          </button>
        </div>
        <ValidationErrorMsg error={errors.password?.message} />

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="পাসওয়ার্ড নিশ্চিত করুন"
            autoComplete="new-password"
            className="border w-full rounded-md p-3 pr-11 outline-none focus:border-primary"
            {...register("confirm_password")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={
              showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"
            }
          >
            {showConfirmPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
          </button>
        </div>
        <ValidationErrorMsg error={errors.confirm_password?.message} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-600 text-white mt-5 p-3 rounded-md flex justify-center disabled:opacity-70"
      >
        {loading ? (
          <LuLoaderCircle size={24} className="animate-spin" />
        ) : (
          "পাসওয়ার্ড আপডেট করুন"
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
