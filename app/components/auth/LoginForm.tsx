"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import OtpInput from "react-otp-input";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doCretendentialLogin } from "@/app/actions";
import ValidationErrorMsg from "../ValidationErrorMsg";
import { LuLoaderCircle } from "react-icons/lu";

const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required." })
    .min(6, { message: "Password must be at least 6 characters" }),
});

type TLoginSchema = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState("");

  const authUser = false; // Replace with actual auth logic

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TLoginSchema>({
    resolver: zodResolver(LoginSchema),
  });

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

  const handleOnSubmit = async (data: TLoginSchema) => {
    setLoading(true);
    const result = await doCretendentialLogin(data.email, data.password);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Redirecting...");
      if (params.get("redirect") === "checkout") {
        return router.push("/checkout");
      }
      router.push("/user/dashboard");
    }
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
    <form onSubmit={handleSubmit(handleOnSubmit)} className="w-full max-w-sm">
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
          <p className="text-xl font-semibold mb-10">আপনার তথ্য দিন</p>
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
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gray-600 text-white mt-5 p-3 rounded-md flex justify-center"
      >
        {loading ? (
          <LuLoaderCircle size={24} className="animate-spin" />
        ) : (
          "লগইন করুন"
        )}
      </button>

      <div className="mt-4 flex items-center justify-center">
        <p className="text-sm text-gray-600">আপনি কি নিবন্ধন করেছেন?</p>{" "}
        <Link
          href="/auth/register"
          className="text-sm text-primary underline ml-4"
        >
          নিবন্ধন করুন
        </Link>
      </div>
    </form>
  );
}
