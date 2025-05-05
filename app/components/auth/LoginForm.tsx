"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import OtpInput from "react-otp-input";

export default function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState("");

  const authUser = false; // Replace with actual auth logic

  const handleNext = () => {
    if (step === 1) {
      if (!inputValue.trim()) {
        alert("মোবাইল নাম্বার/ ইমেইল দিন");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!authUser) {
        if (otp.length !== 4) {
          alert("৪ সংখ্যার OTP দিন");
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
    <div className="w-full max-w-sm">
      {step > 1 && (
        <button onClick={handlePrev} className="mb-5">
          <MdArrowBack size={24} />
        </button>
      )}

      {/* Step 1: Enter Email/Phone */}
      {step === 1 && (
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
      )}

      {/* Step 2: Password or OTP */}
      {step === 2 && (
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
      )}

      {/* Step 3: Registration Form */}
      {step === 3 && !authUser && (
        <div className="space-y-5">
          <p className="text-xl font-semibold mb-10">আপনার তথ্য দিন</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="মোবাইল নাম্বার/ ইমেইল"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="আপনার নাম লিখুন"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="পাসওয়ার্ড লিখুন"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="পাসওয়ার্ড কনফার্ম করুন"
            className="border w-full rounded-md p-3 outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleNext}
        className="w-full bg-gray-600 text-white mt-5 p-3 rounded-md"
      >
        সাবমিট করুন
      </button>
    </div>
  );
}
