import React from "react";

const sampleData = [
  {
    id: 1,
    title: "বছর জুড়ে অনলাইন ব্যাচে কী কী থাকছে?",
    description: "description",
    image: "/images/pexels-pixabay-267885.jpg",
  },
  {
    id: 2,
    title: "বছর জুড়ে অনলাইন ব্যাচে কী কী থাকছে?",
    description: "description",
    image: "/images/pexels-pixabay-267885.jpg",
  },
];

export default function MoreTips() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-10 rounded-3xl py-14 mt-10">
        <p className="text-center text-5xl font-bold mb-10">
          বছর জুড়ে অনলাইন ব্যাচে কী কী থাকছে?
        </p>
        <div className="grid md:grid-cols-2 gap-10">
          {sampleData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-3"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
