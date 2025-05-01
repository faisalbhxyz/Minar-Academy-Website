import React, { useState } from "react";

export default function CourseSubjects() {
  const [courseSub, setCourseSub] = useState(1);

  return (
    <div className="mt-10">
      <p className="text-3xl font-semibold text-center">কোর্সের বিষয়বস্তু</p>
      <ul className="flex items-center justify-center mt-10">
        {[
          { id: 1, label: "রেকর্ডেড ক্লাস" },
          { id: 2, label: "লাইভ ক্লাস" },
          { id: 3, label: "প্রজেক্ট অ্যান্ড অ্যাসাইনমেন্ট" },
          { id: 4, label: "কোর্স আউটলাইন" },
        ].map((tab) => (
          <li
            key={tab.id}
            className={`${
              courseSub === tab.id && "bg-primary text-white"
            } px-6 py-2 rounded-full text-[#424242] transition duration-300 border-transparent cursor-pointer`}
            onClick={() => setCourseSub(tab.id)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
      {courseSub === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">যাদের জন্য</h2>
          <p>
            এই কোর্স তাদের জন্য যারা SSC 2030 টার্গেট করে পড়াশোনা শুরু করতে
            চায়।
          </p>
        </div>
      )}
      {courseSub === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">যাদের জন্য</h2>
          <p>
            এই কোর্স তাদের জন্য যারা SSC 2030 টার্গেট করে পড়াশোনা শুরু করতে
            চায়।
          </p>
        </div>
      )}
      {courseSub === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">যাদের জন্য</h2>
          <p>
            এই কোর্স তাদের জন্য যারা SSC 2030 টার্গেট করে পড়াশোনা শুরু করতে
            চায়।
          </p>
        </div>
      )}
      {courseSub === 4 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">যাদের জন্য</h2>
          <p>
            এই কোর্স তাদের জন্য যারা SSC 2030 টার্গেট করে পড়াশোনা শুরু করতে
            চায়।
          </p>
        </div>
      )}
    </div>
  );
}
