import { cn } from "@/lib/cn";
import React from "react";

export default function ValidationErrorMsg({
  error,
  className,
}: {
  error: string | undefined;
  className?: string;
}) {
  if (!error) return null;

  return <p className={cn("text-red-500 text-[14px] py-1", className)}>{error}</p>;
}
