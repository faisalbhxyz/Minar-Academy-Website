"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BsCalendarWeek } from "react-icons/bs";

// Reusable tab button
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

export default function Dashboard() {
  const [classTab, setClassTab] = useState<"upcoming" | "missed">("upcoming");
  const [resourceTab, setResourceTab] = useState<
    "all" | "academic" | "skill" | "books"
  >("all");

  const classTabs = [
    { key: "upcoming", label: "আপকামিং ক্লাস" },
    { key: "missed", label: "মিসড ক্লাস" },
  ] as const;

  const resourceTabs = [
    { key: "all", label: "সব" },
    { key: "academic", label: "একাডেমিক" },
    { key: "skill", label: "স্কিল ডেভেলপমেন্ট" },
    { key: "books", label: "বইসমূহ" },
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

  const renderResourceContent = () => {
    return <EmptyState message="এই মুহূর্তে এই ক্যাটাগরিতে কোনো তথ্য নেই।" />;
  };

  return (
    <>
      {/* Class Section */}
      <div className="border mt-5 rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-gray-200">
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
        <div className="mt-4">{renderClassContent()}</div>
      </div>

      {/* Resource Section */}
      <div className="border mt-5 rounded-lg p-5">
        <div className="flex space-x-4 border-b border-gray-200">
          {resourceTabs.map((tab) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              isActive={resourceTab === tab.key}
              onClick={() => setResourceTab(tab.key)}
            />
          ))}
        </div>
        <div className="mt-4">{renderResourceContent()}</div>
      </div>
    </>
  );
}
