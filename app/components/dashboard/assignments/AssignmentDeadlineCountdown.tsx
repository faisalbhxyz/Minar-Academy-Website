"use client";

import { formatDeadlineRemaining } from "@/lib/assignmentHelpers";
import { useEffect, useState } from "react";

interface Props {
  initialSeconds: number;
}

export default function AssignmentDeadlineCountdown({ initialSeconds }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (initialSeconds <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSeconds]);

  const expired = secondsLeft <= 0;

  return (
    <span className={expired ? "font-medium text-red-600" : "text-gray-700"}>
      {formatDeadlineRemaining(secondsLeft)}
    </span>
  );
}
