"use client";

import ValidationErrorMsg from "@/app/components/ValidationErrorMsg";
import { formatDate } from "@/lib/helpers";
import { updateStudentProfile } from "@/lib/studentProfileApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LuLoaderCircle } from "react-icons/lu";
import { toast } from "sonner";
import { z } from "zod";

const ProfileSchema = z.object({
  first_name: z
    .string({ required_error: "নাম প্রয়োজন" })
    .trim()
    .min(1, { message: "নাম প্রয়োজন" })
    .max(100, { message: "নাম ১০০ অক্ষরের বেশি হতে পারবে না" }),
  last_name: z
    .string()
    .trim()
    .max(100, { message: "নাম ১০০ অক্ষরের বেশি হতে পারবে না" })
    .optional(),
  phone: z
    .string({ required_error: "মোবাইল নম্বর প্রয়োজন" })
    .trim()
    .min(11, { message: "মোবাইল নম্বর কমপক্ষে ১১ অক্ষর হতে হবে" })
    .max(11, { message: "মোবাইল নম্বর সর্বোচ্চ ১১ অক্ষর হতে হবে" })
    .startsWith("01", { message: "সঠিক মোবাইল নম্বর দিন" }),
});

type TProfileSchema = z.infer<typeof ProfileSchema>;

interface Props {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  createdAt: string;
  accessToken: string;
}

export default function StudentProfileForm({
  firstName,
  lastName,
  email,
  phone,
  createdAt,
  accessToken,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TProfileSchema>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      first_name: firstName,
      last_name: lastName ?? "",
      phone: phone ?? "",
    },
  });

  const handleCancel = () => {
    reset({
      first_name: firstName,
      last_name: lastName ?? "",
      phone: phone ?? "",
    });
    setEditing(false);
  };

  const handleSave = async (data: TProfileSchema) => {
    setSaving(true);

    try {
      const result = await updateStudentProfile(accessToken, {
        first_name: data.first_name,
        last_name: data.last_name ?? "",
        phone: data.phone,
      });

      if (result.sessionReplaced) return;

      if (!result.ok) {
        toast.error(result.error || "প্রোফাইল আপডেট ব্যর্থ হয়েছে");
        return;
      }

      toast.success(result.message || "প্রোফাইল সফলভাবে আপডেট হয়েছে");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 max-w-2xl">
          <p className="text-sm font-medium text-gray-700">ব্যক্তিগত তথ্য</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
          >
            <Pencil className="w-4 h-4" />
            প্রোফাইল সম্পাদনা
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 max-w-2xl">
          <div className="text-gray-600">Registration Date</div>
          <div className="text-gray-800 font-medium">
            {formatDate(createdAt)}
          </div>

          <div className="text-gray-600">First Name</div>
          <div className="text-gray-800 font-medium">{firstName}</div>

          <div className="text-gray-600">Last Name</div>
          <div className="text-gray-800 font-medium">{lastName ?? "-"}</div>

          <div className="text-gray-600">Email</div>
          <div className="text-gray-800 font-medium">{email}</div>

          <div className="text-gray-600">Phone Number</div>
          <div className="text-gray-800 font-medium">{phone ?? "-"}</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="max-w-md space-y-4">
      <p className="text-sm font-medium text-gray-700 mb-2">প্রোফাইল সম্পাদনা</p>

      <div>
        <label className="block text-sm text-gray-600 mb-1">First Name</label>
        <input
          type="text"
          className="border w-full rounded-md p-3 outline-none focus:border-blue-500"
          {...register("first_name")}
        />
        <ValidationErrorMsg error={errors.first_name?.message} />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Last Name</label>
        <input
          type="text"
          className="border w-full rounded-md p-3 outline-none focus:border-blue-500"
          {...register("last_name")}
        />
        <ValidationErrorMsg error={errors.last_name?.message} />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="border w-full rounded-md p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">ইমেইল পরিবর্তন করা যায় না</p>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
        <input
          type="text"
          className="border w-full rounded-md p-3 outline-none focus:border-blue-500"
          placeholder="01XXXXXXXXX"
          {...register("phone")}
        />
        <ValidationErrorMsg error={errors.phone?.message} />
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          {saving && <LuLoaderCircle className="w-4 h-4 animate-spin" />}
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 disabled:opacity-60"
        >
          বাতিল
        </button>
      </div>
    </form>
  );
}
