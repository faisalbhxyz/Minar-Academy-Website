"use client";

import AssignmentRichTextEditor from "@/app/components/dashboard/assignments/AssignmentRichTextEditor";
import {
  formatFileSize,
  formatMaxFileSize,
  isAssignmentResponseEmpty,
  mimeTypesToAccept,
} from "@/lib/assignmentHelpers";
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
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
  maxResponseTextLength?: number;
  initialResponseText?: string;
  existingFiles?: AssignmentAttachment[];
  isResubmit?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function AssignmentSubmitForm({
  courseSlug,
  assignmentId,
  fileUploadLimit,
  accessToken,
  maxFileSizeBytes = 2 * 1024 * 1024,
  allowedMimeTypes,
  maxResponseTextLength = 50000,
  initialResponseText = "",
  existingFiles = [],
  isResubmit = false,
  submitLabel = "Submit Assignment",
  onCancel,
  onSuccess,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [responseText, setResponseText] = useState(initialResponseText);
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

    const oversized = files.find((file) => file.size > maxFileSizeBytes);
    if (oversized) {
      toast.error(
        `${oversized.name} exceeds the ${formatMaxFileSize(maxFileSizeBytes)} file size limit`
      );
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

    const hasText = !isAssignmentResponseEmpty(responseText);
    const hasNewFiles = selectedFiles.length > 0;
    const hadPriorContent =
      isResubmit &&
      (!isAssignmentResponseEmpty(initialResponseText) ||
        existingFiles.length > 0);

    if (!isResubmit) {
      if (!hasText && !hasNewFiles) {
        toast.error("Write a response or upload at least one file");
        return;
      }
    } else if (!hasText && !hasNewFiles && !hadPriorContent) {
      toast.error("Write a response or upload at least one file");
      return;
    }

    if (responseText.length > maxResponseTextLength) {
      toast.error(
        `Response text exceeds maximum length of ${maxResponseTextLength} characters`
      );
      return;
    }

    if (hasNewFiles && selectedFiles.length > fileUploadLimit) {
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
      if (hasText) {
        formData.append("response_text", responseText);
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
          json.error || json.message || "Failed to submit assignment"
        );
        return;
      }

      toast.success(json.message || "Assignment submitted successfully");
      onSuccess?.();
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Assignment Submission
        </h3>
        <p className="mt-1 text-sm text-gray-500">Assignment answer form</p>
      </div>

      <div>
        <label className="sr-only">Your answer</label>
        <AssignmentRichTextEditor
          value={responseText}
          onChange={setResponseText}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label
          htmlFor="assignment_files"
          className="block text-sm font-medium text-gray-800"
        >
          Attach assignment files (Max: {fileUploadLimit}{" "}
          {fileUploadLimit === 1 ? "file" : "files"})
        </label>
        <div className="mt-3">
          <input
            ref={fileInputRef}
            id="assignment_files"
            type="file"
            multiple={fileUploadLimit > 1}
            accept={mimeTypesToAccept(allowedMimeTypes)}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
          />
        </div>
        <div className="mt-3 space-y-1 text-xs text-gray-500">
          <p>
            File Support: Any standard Image, Document, Presentation, Sheet, PDF
            or Text file is allowed
          </p>
          <p>Total File Size: Max {formatMaxFileSize(maxFileSizeBytes)} per file</p>
        </div>

        {isResubmit && existingFiles.length > 0 && selectedFiles.length === 0 && (
          <ul className="mt-4 space-y-2">
            <p className="text-xs font-medium text-gray-600">Current files:</p>
            {existingFiles.map((file) => (
              <li
                key={file.id ?? file.url}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                {file.file_name} ({formatFileSize(file.size)})
              </li>
            ))}
          </ul>
        )}

        {selectedFiles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="shrink-0 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <LuLoaderCircle className="animate-spin" />}
          {submitting ? "Submitting..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
