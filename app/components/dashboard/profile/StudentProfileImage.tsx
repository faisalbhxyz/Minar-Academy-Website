"use client";

import { compressProfileImage } from "@/lib/compressProfileImage";
import {
  PROFILE_IMAGE_ACCEPTED_TYPES,
  PROFILE_IMAGE_MAX_BYTES,
  updateStudentProfile,
} from "@/lib/studentProfileApi";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { toast } from "sonner";

const ACCEPTED_TYPES: string[] = [...PROFILE_IMAGE_ACCEPTED_TYPES];

interface Props {
  profileImage: string | null | undefined;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  accessToken: string;
}

function getInitials(firstName: string, lastName?: string | null) {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return (first + last).toUpperCase() || "?";
}

export default function StudentProfileImage({
  profileImage,
  firstName,
  lastName,
  phone,
  accessToken,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState(profileImage);

  const displayImage = previewUrl ?? currentImage;
  const hasPendingChange = Boolean(selectedFile);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("শুধু JPG বা PNG ফাইল সাপোর্ট করা হয়");
      event.target.value = "";
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error("ছবির সাইজ সর্বোচ্চ ২ MB হতে হবে");
      event.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("একটি ছবি নির্বাচন করুন");
      return;
    }

    setUploading(true);

    try {
      const compressedFile = await compressProfileImage(selectedFile);
      const result = await updateStudentProfile(accessToken, {
        first_name: firstName,
        last_name: lastName,
        phone,
        profile_image: compressedFile,
      });

      if (result.sessionReplaced) return;

      if (!result.ok) {
        toast.error(result.error || "ছবি আপলোড ব্যর্থ হয়েছে");
        return;
      }

      const updatedImage = result.data.profile_image ?? previewUrl;

      if (updatedImage) setCurrentImage(updatedImage);
      toast.success(result.message || "প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে");
      resetSelection();
      router.refresh();
    } catch {
      toast.error("কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative group shrink-0">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-blue-100 border-2 border-gray-200 flex items-center justify-center">
            {displayImage ? (
              <Image
                src={displayImage}
                alt="Profile photo"
                width={112}
                height={112}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-3xl font-bold text-blue-600">
                {getInitials(firstName, lastName)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition disabled:opacity-60"
            aria-label={
              currentImage ? "Change profile photo" : "Add profile photo"
            }
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">
            {currentImage ? "প্রোফাইল ছবি" : "প্রোফাইল ছবি যোগ করুন"}
          </p>
          <p className="text-xs text-gray-500">
            JPG বা PNG — সর্বোচ্চ ২ MB
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60"
            >
              {currentImage ? "ছবি পরিবর্তন" : "ছবি যোগ করুন"}
            </button>
            {hasPendingChange && (
              <>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg font-medium transition"
                >
                  {uploading && (
                    <LuLoaderCircle className="w-4 h-4 animate-spin" />
                  )}
                  {uploading ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </button>
                <button
                  type="button"
                  onClick={resetSelection}
                  disabled={uploading}
                  className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-60"
                >
                  বাতিল
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
