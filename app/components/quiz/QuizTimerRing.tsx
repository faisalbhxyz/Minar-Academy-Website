"use client";

import { formatQuizTimerDetailed } from "@/lib/quizHelpers";

interface Props {
  secondsLeft: number;
  totalSeconds: number;
}

export default function QuizTimerRing({ secondsLeft, totalSeconds }: Props) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress =
    totalSeconds > 0 ? Math.min(1, Math.max(0, secondsLeft / totalSeconds)) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const urgent = secondsLeft <= 60;

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm text-gray-600">Time remaining:</span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          urgent ? "text-red-600" : "text-gray-900"
        }`}
      >
        {formatQuizTimerDetailed(secondsLeft)}
      </span>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        className="-rotate-90 shrink-0"
        aria-hidden
      >
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3.5"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={urgent ? "#dc2626" : "#2563eb"}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
    </div>
  );
}
