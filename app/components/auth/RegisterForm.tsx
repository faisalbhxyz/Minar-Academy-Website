"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import OtpInput from "react-otp-input";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ValidationErrorMsg from "../ValidationErrorMsg";
import axiosInstance from "@/lib/axiosInstance";

const RegisterSchema = z
  .object({
    first_name: z
      .string({ required_error: "Name is required." })
      .trim()
      .min(1, { message: "Name is required." })
      .max(100, { message: "Name should not exceed 100 characters" }),
    last_name: z
      .string({ required_error: "Name is required." })
      .trim()
      .max(100, { message: "Name should not exceed 100 characters" })
      .optional(),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email({ message: "Invalid email address" }),
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(11, { message: "Phone number must be at least 11 characters" })
      .max(11, { message: "Phone number must be at most 11 characters" })
      .startsWith("01", { message: "Invalid phone number" }),
    // image: z
    //   .any()
    //   .refine((file) => {
    //     if (!file) return true; // Allow empty
    //     return file.size <= 2 * 1024 * 1024; // Check size
    //   }, "Max image size is 2MB.")
    //   .refine((file) => {
    //     if (!file) return true; // Allow empty
    //     return ["image/png", "image/jpg", "image/jpeg"].includes(file.type); // Check file type
    //   }, "Only .png, .jpg & .jpeg formats are supported.")
    //   .refine((file) => {
    //     if (!file) return true;
    //     return new Promise<boolean>((resolve) => {
    //       const img = document.createElement("img") as HTMLImageElement;
    //       img.src = URL.createObjectURL(file);
    //       img.onload = () => {
    //         const isValid = img.width <= 1920 && img.height <= 1080; // example dimensions
    //         resolve(isValid);
    //       };
    //       img.onerror = () => resolve(false); // in case of an error loading the image
    //     });
    //   }, "Image must be 1920x1080 pixels or smaller."),
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

type TRegisterSchema = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterSchema>({
    resolver: zodResolver(RegisterSchema),
  });

  const authUser = false; // Replace with actual auth logic

  const handleNext = () => {
    if (step === 1) {
      if (!inputValue.trim()) {
        toast.error("মোবাইল নাম্বার/ ইমেইল দিন");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!authUser) {
        if (otp.length !== 4) {
          toast.error("৪ সংখ্যার OTP দিন");
          return;
        }
        setStep(3);
      } else {
        router.push("/dashboard");
      }
    } else if (step === 3) {
      router.push("/dashboard");
    }
  };

  const handlePrev = () => {
    if (step === 2) {
      setIsForgotPassword(false);
      setStep(1);
      setOtp("");
    }
  };

  const handleForgottenPassword = () => {
    setIsForgotPassword(true);
  };

  const handleSave = (data: TRegisterSchema) => {
    axiosInstance
      .post("/student/register", data, {
        headers: {
          "Content-Type": "application/json",
          "app-key": process.env.NEXT_PUBLIC_APP_KEY,
        },
      })
      .then(() => {
        router.push("/auth/login");
        toast.success("আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে");
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      });
  };

  const renderOtpInput = () => (
    <>
      <p className="font-medium mb-1">
        01785868620 নাম্বার/ইমেইল পাঠানো 4 সংখ্যার কোডটি লিখুন
      </p>
      <OtpInput
        value={otp}
        onChange={setOtp}
        numInputs={4}
        renderInput={(props, index) => (
          <input {...props} autoFocus={index === 0} />
        )}
        inputStyle={{
          width: "100%",
          height: "4rem",
          margin: "0 0.3rem",
          fontSize: "2.5rem",
          borderRadius: "0.375rem",
          border: "1px solid #ccc",
        }}
        containerStyle={{
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      />
    </>
  );

  return (
    <form className="w-full max-w-sm" onSubmit={handleSubmit(handleSave)}>
      {step > 1 && (
        <button type="button" onClick={handlePrev} className="mb-5">
          <MdArrowBack size={24} />
        </button>
      )}

      {/* Step 1: Enter Email/Phone */}
      {/* {step === 1 && (
        <>
          <p className="text-xl font-semibold mb-10">
            মোবাইল নাম্বার/ ইমেইল দিয়ে এগিয়ে যান
          </p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            placeholder="মোবাইল নাম্বার/ ইমেইল"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
          />
        </>
      )} */}

      {/* Step 2: Password or OTP */}
      {/* {step === 2 && (
        <>
          {isForgotPassword || !authUser ? (
            renderOtpInput()
          ) : (
            <>
              <p className="text-xl font-semibold mb-10">স্বাগতম</p>
              <input
                type="password"
                autoFocus
                placeholder="পাসওয়ার্ড লিখুন"
                className="border w-full rounded-md p-3 outline-none focus:border-primary"
              />
            </>
          )}

          {!isForgotPassword && authUser && (
            <div className="flex items-center justify-end mt-1">
              <button
                onClick={handleForgottenPassword}
                className="text-sm text-primary"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
          )}
        </>
      )} */}

      {/* Step 3: Registration Form */}
      {step === 1 && !authUser && (
        <div className="space-y-5">
          {/* <p className="text-xl font-semibold mb-10">আপনার তথ্য দিন</p> */}
          <p className="text-xl font-semibold mb-10">নিবন্ধন করুন</p>
          <input
            type="text"
            placeholder="নামের প্রথম অংকে লিখুন"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
            {...register("first_name")}
          />
          <ValidationErrorMsg error={errors.first_name?.message} />
          <input
            type="text"
            placeholder="নামের শেষ অংকে লিখুন"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
            {...register("last_name")}
          />
          <ValidationErrorMsg error={errors.last_name?.message} />
          <input
            type="text"
            placeholder="মোবাইল নাম্বার"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
            {...register("phone")}
          />
          <ValidationErrorMsg error={errors.phone?.message} />
          <input
            type="text"
            placeholder="ইমেইল"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
            {...register("email")}
          />
          <ValidationErrorMsg error={errors.email?.message} />
          <input
            type="password"
            placeholder="পাসওয়ার্ড লিখুন"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
            {...register("password")}
          />
          <ValidationErrorMsg error={errors.password?.message} />
          <input
            type="password"
            placeholder="পাসওয়ার্ড কনফার্ম করুন"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
            {...register("confirm_password")}
          />
          <ValidationErrorMsg error={errors.confirm_password?.message} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gray-600 text-white mt-5 p-3 rounded-md"
        disabled={isSubmitting}
      >
        সাবমিট করুন
      </button>
    </form>
  );
}
