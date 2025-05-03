// app/page.tsx
import SubjectCard from "@/app/(home)/resource/SubjectCard";
import React from "react";

const subjects = [
  {
    id: 1,
    name: "অপরিচিতা",
    image: "/images/Screenshot_5_1741766787745.png",
    description: "অপরিচিতা",
  },
  {
    id: 2,
    name: "মানব কল্যাণ",
    image: "/images/Screenshot_5_1741766787745.png",
    description: "মানব কল্যাণ",
  },
];

export default function page() {
  return (
    <div className="wrapper py-10">
      <div className="grid lg:grid-cols-4 gap-5">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
}
