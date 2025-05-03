// app/page.tsx
import SubjectCard from "@/app/(home)/resource/SubjectCard";
import React from "react";

const subjects = [
  {
    id: 1,
    name: "সমাস",
    image: "/images/Screenshot_5_1741766787745.png",
    description: "সমাস",
  },
  {
    id: 2,
    name: "বাংলা ভাষা ও উচ্চারণ",
    image: "/images/Screenshot_5_1741766787745.png",
    description: "বাংলা ভাষা ও উচ্চারণ",
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
