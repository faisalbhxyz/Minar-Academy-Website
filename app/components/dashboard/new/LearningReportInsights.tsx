"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchLearningReportClient,
  type LearningReportPeriod,
} from "@/lib/storefrontV2Api";
import { formatLearningDuration } from "@/lib/learningReportFormat";

type Props = {
  accessToken: string;
  initialData?: StudentLearningReportData | null;
};

const PERIODS: LearningReportPeriod[] = ["7d", "30d", "90d"];

const PERIOD_LABELS: Record<LearningReportPeriod, string> = {
  "7d": "৭ দিন",
  "30d": "৩০ দিন",
  "90d": "৯০ দিন",
};

export default function LearningReportInsights({
  accessToken,
  initialData,
}: Props) {
  const [period, setPeriod] = useState<LearningReportPeriod>("7d");

  const reportQuery = useQuery({
    queryKey: ["learning-report-api", period],
    queryFn: () => fetchLearningReportClient(period, accessToken),
    initialData: period === "7d" ? initialData ?? undefined : undefined,
    staleTime: 60_000,
  });

  const data = reportQuery.data;
  const totalSeconds =
    data?.daily_watch_seconds.reduce((sum, row) => sum + row.seconds, 0) ?? 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">শেখার অন্তর্দৃষ্টি</h2>
        <div className="flex gap-2">
          {PERIODS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                period === option
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {PERIOD_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {reportQuery.isLoading && !data ? (
        <p className="p-6 text-sm text-gray-500">লোড হচ্ছে...</p>
      ) : data ? (
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightCard label="ধারাবাহিকতা" value={`${data.streak_days} দিন`} />
          <InsightCard
            label="মোট শেখার সময়"
            value={formatLearningDuration(totalSeconds)}
          />
          <InsightCard
            label="কুইজ নির্ভুলতা"
            value={`${Math.round(data.quiz_accuracy_percent)}%`}
          />
          <InsightCard
            label="কোর্স সম্পন্ন"
            value={String(data.courses_completed)}
            sub={`${data.courses_in_progress} চলমান`}
          />
        </div>
      ) : (
        <p className="p-6 text-sm text-gray-500">
          শেখার রিপোর্ট এখনো উপলব্ধ নয়।
        </p>
      )}

      {data && data.daily_watch_seconds.length > 0 ? (
        <div className="px-4 pb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">দৈনিক শেখার সময়</p>
          <div className="flex items-end gap-1 h-32 border-t border-gray-100 pt-3">
            {data.daily_watch_seconds.map((row) => {
              const max = Math.max(
                ...data.daily_watch_seconds.map((item) => item.seconds),
                1
              );
              const height = Math.max(4, Math.round((row.seconds / max) * 100));
              return (
                <div
                  key={row.date}
                  className="flex-1 flex flex-col items-center gap-1 min-w-0"
                >
                  <div
                    className="w-full max-w-[28px] bg-indigo-500 rounded-t"
                    style={{ height: `${height}%` }}
                    title={formatLearningDuration(row.seconds)}
                  />
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">
                    {row.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InsightCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-indigo-600 mt-1">{value}</p>
      {sub ? <p className="text-xs text-gray-500 mt-1">{sub}</p> : null}
    </div>
  );
}
