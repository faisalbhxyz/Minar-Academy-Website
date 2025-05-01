import React, { useState } from "react";
import Modal from "../ui/Modal";
import Image from "next/image";

export default function SeeMore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-primary text-sm mt-3"
      >
        See More
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 text-xl"
        >
          &times;
        </button>
        <div className="flex items-center gap-3">
          <Image
            src={"/images/profile.png"}
            alt={"image"}
            width={100}
            height={100}
            className="w-16 h-16 rounded-full mb-4"
          />
          <div>
            <h3 className="text-xl font-medium">Sajib</h3>
            <p className="text-sm text-gray-500 mb-2">Batch 1</p>
            <div className="text-yellow-500 mb-2 text-2xl">
              {"★".repeat(5) + "☆".repeat(5 - 5)}
            </div>
          </div>
        </div>
        <p className="text-gray-700">
          The Data Analytics and Business Intelligence course at Interactive
          Cares has been an exceptional learning experience. The instructors,
          support team, and well-structured syllabus made the journey smooth and
          enriching. Through this course, I developed key technical skills in
          Python, R, SQL, and Excel, enabling me to efficiently collect,
          process, and analyze large datasets. I also gained hands-on experience
          with data visualization tools like Tableau and Power BI, which helped
          me create impactful visual representations for better decision-making.
          Working on real-life case studies allowed me to apply analytics to
          solve practical business problems across various industries,
          significantly improving my problem-solving and decision-making
          abilities. Completing this course under the guidance of Md Shabbir
          Hossain has boosted my career prospects, making me well-prepared for
          roles like Data Analyst, BI Analyst, and Data Scientist. Overall, this
          course provides invaluable technical and analytical expertise, making
          it an excellent choice for anyone looking to excel in the data
          analytics and business intelligence field.
        </p>
      </Modal>
    </>
  );
}
