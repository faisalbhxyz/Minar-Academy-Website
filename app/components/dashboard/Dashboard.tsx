"use client";

import FireIcon from "@/public/icons/FireIcon";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BsCalendarWeek } from "react-icons/bs";
import PopularActivity from "./PopularActivity";
import Shortcuts from "./Shortcuts";
import { Session } from "next-auth";
import { formatDate } from "@/lib/helpers";
import ProgramCard from "../courses/ProgramCard";
import EnrolledProgramCard from "../courses/EnrolledProgramCard";

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

export default function Dashboard({
  session,
  stdDetails,
  enrolledCourses,
}: {
  session: Session;
  stdDetails: Student;
  enrolledCourses: Enrollment[];
}) {
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
    // { key: "academic", label: "একাডেমিক" },
    // { key: "skill", label: "স্কিল ডেভেলপমেন্ট" },
    // { key: "books", label: "বইসমূহ" },
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

  const renderResourceContent = ({
    enrolments,
  }: {
    enrolments: Enrollment[];
  }) => {
    if (enrolments.length === 0)
      return <EmptyState message="এই মুহূর্তে এই ক্যাটাগরিতে কোনো তথ্য নেই।" />;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {enrolments.map((item) => (
          <EnrolledProgramCard key={item.id} item={item.course} />
        ))}
      </div>
    );
  };

  return (
    <div className="wrapper flex flex-col-reverse lg:flex-row items-start my-5 gap-5">
      <div className="w-full">
        <div className="border p-5 rounded-lg overflow-x-auto">
          <Shortcuts />
        </div>
        {/* Class Section */}
        <div className="border mt-5 rounded-lg p-5">
          <div className="overflow-x-auto">
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

        {/* Resource Section */}
        <div className="border mt-5 rounded-lg p-5">
          <p className="text-2xl font-semibold mb-2">আমার পড়াশুনা</p>
          <div className="overflow-x-auto">
            <div className="min-w-lg flex space-x-4 border-b border-gray-200">
              {resourceTabs.map((tab) => (
                <TabButton
                  key={tab.key}
                  label={tab.label}
                  isActive={resourceTab === tab.key}
                  onClick={() => setResourceTab(tab.key)}
                />
              ))}
            </div>
          </div>
          <div className="mt-4">
            {renderResourceContent({ enrolments: enrolledCourses })}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-96 lg:min-w-96">
        <div className="border rounded-lg p-5">
          <div className="flex items-center gap-5">
            <Image
              src="/images/avatar.png"
              alt="image"
              width={100}
              height={100}
              className="w-14 h-14 rounded-md"
            />
            <div>
              <p>
                {session.user.name ||
                  [session.user.first_name, session.user.last_name]
                    .filter(Boolean)
                    .join(" ") ||
                  session.user.email}
              </p>
              {/* <p>Class</p> */}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-5">
            <Image
              src="/images/Group_1125211977_1723542990003.jpeg"
              alt="image"
              width={50}
              height={50}
              className="w-5 h-5"
            />
            <p>Joined Minar academy on {formatDate(stdDetails?.created_at)}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Image
              src="/images/book_1723543195014.jpeg"
              alt="image"
              width={50}
              height={50}
              className="w-5 h-5"
            />
            <p>Enrolled {stdDetails?.enrollments.length} courses</p>
          </div>
        </div>
        {/* <div className="border rounded-lg mt-5">
          <div className="px-4 py-3 text-xl border-b font-semibold border-gray-200">
            গত সাত দিনের শিখন কার্যক্রম
          </div>
          <div className="flex items-center gap-3 justify-center py-3">
            <FireIcon className="" />
            <FireIcon className="" />
            <FireIcon className="" />
            <FireIcon className="" />
            <FireIcon className="" />
            <FireIcon className="" />
            <FireIcon className="fill-red-500" />
          </div>
          <div className="flex items-center justify-between p-4 text-sm">
            <div className="flex items-center gap-2">
              ইনএকটিভ{" "}
              <span className="block w-3 h-3 bg-orange-300 rounded-full" />{" "}
              <span className="block w-3 h-3 bg-orange-400 rounded-full" />{" "}
              <span className="block w-3 h-3 bg-orange-500 rounded-full" />{" "}
              <span>একটিভ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="block w-3 h-3 bg-red-500 rounded-full" /> আজ
            </div>
          </div>
        </div> */}
        {/* <PopularActivity /> */}
      </div>
    </div>
  );
}
