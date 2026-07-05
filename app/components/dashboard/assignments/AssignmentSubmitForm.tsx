"use client";

import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import { ifSessionReplaced } from "@/lib/sessionReplaced";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";

interface Props {
  courseSlug: string;
  assignmentId: number;
  fileUploadLimit: number;
  accessToken: string;
}

export default function AssignmentSubmitForm({
  courseSlug,
  assignmentId,
  fileUploadLimit,
  accessToken,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [responseText, setResponseText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > fileUploadLimit) {
      toast.error(`Maximum ${fileUploadLimit} file(s) allowed`);
      event.target.value = "";
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedText = responseText.trim();
    if (!trimmedText && selectedFiles.length === 0) {
      toast.error("Write a response or upload at least one file");
      return;
    }

    if (selectedFiles.length > fileUploadLimit) {
      toast.error(`Maximum ${fileUploadLimit} file(s) allowed`);
      return;
    }

    if (!publicApiBaseUrl || !publicAppKey) {
      toast.error("App configuration is missing");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      if (trimmedText) {
        formData.append("response_text", trimmedText);
      }
      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      const res = await fetch(
        `${publicApiBaseUrl}/course/${courseSlug}/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          headers: {
            "app-key": publicAppKey,
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const json = await res.json().catch(() => ({}));

      if (await ifSessionReplaced(res, json)) return;

      if (!res.ok) {
        toast.error(
          json.message || json.error || "Failed to submit assignment"
        );
        return;
      }

      toast.success(json.message || "Assignment submitted successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="response_text"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Your answer
        </label>
        <textarea
          id="response_text"
          value={responseText}
          onChange={(event) => setResponseText(event.target.value)}
          rows={8}
          placeholder="Write your assignment response here..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          You can submit text, files, or both.
        </p>
      </div>

      <div>
        <label
          htmlFor="assignment_files"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Upload files (max {fileUploadLimit})
        </label>
        <input
          ref={fileInputRef}
          id="assignment_files"
          type="file"
          multiple={fileUploadLimit > 1}
          accept="image/*,.pdf,.doc,.docx,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Supported: images, PDF, DOC/DOCX, ZIP
        </p>

        {selectedFiles.length > 0 && (
          <ul className="mt-3 space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
      >
        {submitting && <LuLoaderCircle className="animate-spin" />}
        {submitting ? "Submitting..." : "Submit assignment"}
      </button>
    </form>
  );
}
