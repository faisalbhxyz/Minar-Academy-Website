"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BsCalendarWeek } from "react-icons/bs";
import Shortcuts from "../dashboard/Shortcuts";

const TabButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 border-b transition-colors ${
      isActive ? "border-primary text-primary" : "border-transparent"
    }`}
  >
    {label}
  </button>
);

// Reusable empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center">
    <Image
      src="/images/36_1670929041394.png"
      alt="empty state"
      width={100}
      height={100}
      className="w-36 h-36"
    />
    <p>{message}</p>
  </div>
);

export default function ClassTen() {
  const [classTab, setClassTab] = useState<"upcoming" | "missed">("upcoming");
  const classTabs = [
    { key: "upcoming", label: "আপকামিং ক্লাস" },
    { key: "missed", label: "মিসড ক্লাস" },
  ] as const;

  const renderClassContent = () => {
    switch (classTab) {
      case "upcoming":
        return (
          <EmptyState message="এই মুহূর্তে আপনার কোনো আপকামিং ক্লাস নেই।" />
        );
      case "missed":
        return <EmptyState message="এই মুহূর্তে আপনার কোনো মিসড ক্লাস নেই।" />;
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Shortcuts />
      </div>

      <div className="overflow-x-auto mt-10">
        <div className="min-w-md flex items-center justify-between border-b border-gray-200">
          <div className="flex space-x-4">
            {classTabs.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                isActive={classTab === tab.key}
                onClick={() => setClassTab(tab.key)}
              />
            ))}
          </div>
          <Link href="#" className="text-primary flex items-center gap-2">
            <BsCalendarWeek />
            ফুল রুটিন দেখুন
          </Link>
        </div>
      </div>
      <div className="mt-4">{renderClassContent()}</div>
    </div>
  );
}
