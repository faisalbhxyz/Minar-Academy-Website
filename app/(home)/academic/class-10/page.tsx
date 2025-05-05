import ClassTen from "@/app/components/academics/ClassTen";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const sampleOnlineBatch = [
  {
    id: 1,
    title: "HSC 26 অনলাইন ব্যাচ - ইংরেজি 2.0",
    image: "/images/hsc-2026-online-batch-chemistry-sqr-thumbnail.jpg",
    topics: [
      "৩টি বিষয়",
      "প্রতি সপ্তাহে ৬টি লাইভ ক্লাস",
      "ডেইলি, সাপ্তাহিক ও মাসিক এক্সাম",
      "বিষয়ভিত্তিক সাপ্তাহিক QnA সেশন",
      "অধ্যায়ভিত্তিক লেকচার শিট",
    ],
  },
  {
    id: 2,
    title: "HSC 26 অনলাইন ব্যাচ - ইংরেজি 2.0",
    image: "/images/hsc-2026-online-batch-chemistry-sqr-thumbnail.jpg",
    topics: [
      "৩টি বিষয়",
      "প্রতি সপ্তাহে ৬টি লাইভ ক্লাস",
      "ডেইলি, সাপ্তাহিক ও মাসিক এক্সাম",
      "বিষয়ভিত্তিক সাপ্তাহিক QnA সেশন",
      "অধ্যায়ভিত্তিক লেকচার শিট",
    ],
  },
];
const sampleLiveCourse = [
  {
    id: 1,
    title: "HSC 26 অনলাইন ব্যাচ - ইংরেজি 2.0",
    image: "/images/hsc-2026-online-batch-chemistry-sqr-thumbnail.jpg",
    author: "Farhan sakib",
    price: 1200,
  },
  {
    id: 2,
    title: "HSC 26 অনলাইন ব্যাচ - ইংরেজি 2.0",
    image: "/images/hsc-2026-online-batch-chemistry-sqr-thumbnail.jpg",
    author: "Farhan sakib",
    price: 1200,
  },
  {
    id: 3,
    title: "HSC 26 অনলাইন ব্যাচ - ইংরেজি 2.0",
    image: "/images/hsc-2026-online-batch-chemistry-sqr-thumbnail.jpg",
    author: "Farhan sakib",
    price: 1200,
  },
  {
    id: 4,
    title: "HSC 26 অনলাইন ব্যাচ - ইংরেজি 2.0",
    image: "/images/hsc-2026-online-batch-chemistry-sqr-thumbnail.jpg",
    author: "Farhan sakib",
    price: 1200,
  },
];

export default function page() {
  return (
    <div className="wrapper py-10">
      <div className="max-w-3xl">
        <ClassTen />
      </div>
      <div className="mt-20">
        <p className="text-2xl font-semibold">অনলাইন ব্যাচ</p>
        <p>
          দেশের যেকোনো প্রান্ত থেকে ঘরে বসেই দেশ সেরা শিক্ষকদের সাথে নাও
          সম্পূর্ণ সিলেবাসের 💯 তে 💯 প্রস্তুতি!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {sampleOnlineBatch.map((item) => (
            <Link
              key={item.id}
              href=""
              className="bg-white border flex items-center justify-between rounded-2xl shadow-md p-4 hover:shadow-lg transition"
            >
              <div>
                <h3 className="text-lg font-bold mt-4">{item.title}</h3>
                <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                  {item.topics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
                <button className="px-5 py-2 bg-primary text-white mt-5 rounded-md">
                  বিস্তারিত দেখো
                </button>
              </div>
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={400}
                className="rounded-xl w-52 h-52 object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-20">
        <p className="text-2xl font-semibold">লাইভ কোর্সসমূহ</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          {sampleLiveCourse.map((item) => (
            <Link
              key={item.id}
              href=""
              className="bg-white border rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={400}
                className="rounded-t-xl w-full h-52 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold mt-4">{item.title}</h3>
                <p className="text-gray-500 mt-1">{item.author}</p>
                <div className="mt-5 text-primary font-semibold">
                  <p>৳ {item.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
