import Image from "next/image";
import React from "react";
import founderImg from "@/public/images/Founder Minar Academy Logo.jpg";
import teacherpanel from "@/public/images/Teacher Panel Minar Academy.png";

export default function page() {
  return (
    <div className="p-4 wrapper flex gap-8 items-stretch justify-center">
      <section className="py-12 px-4 md:px-12 text-center space-y-10">
        {/* Heading */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Minar Academy — <span>মাদ্রাসা শিক্ষায় আপনার স্মার্ট পার্টনার</span>
          </h2>
          <p className="mt-4 max-w-4xl mx-auto text-gray-700 text-lg">
            Minar Academy হলো বাংলাদেশের প্রথম পূর্ণাঙ্গ ডিজিটাল ই-লার্নিং
            প্ল্যাটফর্ম, যা মাদ্রাসা শিক্ষার্থীদের জন্য বিশেষভাবে তৈরি। আমরা
            প্রযুক্তি ও শিক্ষার মেলবন্ধনে বিশ্বাস করি—যেখানে একজন শিক্ষার্থী
            কেবল পাঠ্যপুস্তকের গণ্ডিতেই আটকে থাকবে না, বরং নিজেকে গড়ে তুলবে
            আত্মবিশ্বাসী, দক্ষ ও ভবিষ্যতপ্রস্তুত একজন মানুষ হিসেবে।
          </p>
        </div>

        {/* Story */}
        <div className="bg-[#20B487] p-6 rounded-lg w-full mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <Image
              src={teacherpanel}
              alt="Team Minar Academy"
              className="rounded-md"
            />
            <div className="text-left text-lg font-medium text-white">
              <h3 className="text-2xl font-semibold text-white mb-4">
                আমাদের গল্প
              </h3>
              <p className="mb-2">
                জেনারেল শিক্ষার জন্য অসংখ্য ডিজিটাল প্ল্যাটফর্ম থাকলেও, মাদ্রাসা
                শিক্ষার্থীদের জন্য তেমন কিছু নেই। তাই কি তারা পিছিয়ে থাকবে?
              </p>
              <p className="mb-2">
                আমরা বিশ্বাস করি, শিক্ষা মানে শুধু বইয়ের মধ্যে সীমাবদ্ধ থাকা
                নয়; শিক্ষা মানে একজন শিক্ষার্থীকে আত্মবিশ্বাস, প্রযুক্তি-দক্ষতা
                আর নৈতিকতার সঙ্গে গড়ে তোলা।
              </p>
              <p>
                সেই বিশ্বাস থেকেই জন্ম নিয়েছে Minar Academy — দেশের প্রথম
                পূর্ণাঙ্গ ডিজিটাল ই-লার্নিং প্ল্যাটফর্ম, যা বিশেষভাবে মাদ্রাসা
                শিক্ষার্থীদের জন্য তৈরি। লাইভ ক্লাস, ভিডিও লেসন, মডেল টেস্ট,
                গেমিফায়েড লার্নিং – সবকিছু এক জায়গায়, সহজে আর সুলভে।
              </p>
              <p className="mt-3">
                আমাদের গল্প একটাই: প্রযুক্তির শক্তিতে মাদ্রাসা শিক্ষার্থীদের
                স্বপ্নকে বাস্তবের পথে এগিয়ে নেওয়া।
              </p>
            </div>
          </div>
        </div>

        {/* Vision and Mission */}
        <div className="grid md:grid-cols-2 gap-6 mx-auto">
          <div className="bg-[#C38E46] p-6 rounded-lg">
            <h4 className="text-2xl font-semibold text-white mb-2">ভিশন</h4>
            <p className="text-lg font-medium text-white">
              মাদ্রাসা শিক্ষার্থীদের জন্য দেশের শীর্ষ ডিজিটাল শিক্ষা প্ল্যাটফর্ম
              হয়ে ওঠা, যা তাদের জ্ঞান, দক্ষতা ও মানবিক গুণে সমৃদ্ধ করবে।
            </p>
          </div>
          <div className="bg-[#256962] p-6 rounded-lg">
            <h4 className="text-2xl font-semibold text-white mb-2">মিশন</h4>
            <p className="text-white text-lg font-medium">
              আমাদের লক্ষ্য প্রযুক্তির মাধ্যমে মানসম্মত, সুলভ ও সহজলভ্য শিক্ষা
              প্রদান করা। পাশাপাশি শিক্ষার্থীদের মধ্যে সমালোচনামূলক চিন্তাভাবনা,
              আত্মবিশ্বাস ও নেতৃত্বের গুণাবলি বিকশিত করা। ধর্মীয় ও সাধারণ
              শিক্ষার মধ্যে ভারসাম্য তৈরি করে একটি সমন্বিত ও ভারসাম্যপূর্ণ
              ভবিষ্যত গড়ে তোলা।
            </p>
          </div>
        </div>

        {/* Founder Quote */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mx-auto mt-10">
          <Image
            src={founderImg}
            alt="MD Mainuddin Hassan"
            width={1000}
            height={1000}
            className="w-[450px] h-full rounded-2xl object-cover"
          />
          <div className="text-left text-gray-800 space-y-2">
            <h4 className="text-2xl font-semibold mb-2">প্রতিষ্ঠাতার সঙ্গে পরিচিত হোন</h4>
            <p className="text-base text-justify">
              মো: মাঈনুদ্দীন হাসান একজন মেধাবী, পরিশ্রমী ও দূরদর্শী তরুণ
              উদ্যোক্তা। বর্তমানে তিনি চট্টগ্রাম বিশ্ববিদ্যালয়ের ইসলামিক স্টাডিজ
              বিভাগে অধ্যয়নরত।
            </p>
            <p className="text-base text-justify">
              প্রযুক্তির অভাবে দেশের হাজারো মাদ্রাসা শিক্ষার্থী এখনো মানসম্মত
              শিক্ষা থেকে বঞ্চিত—এই উপলব্ধি থেকেই তাঁর উদ্যোগে প্রতিষ্ঠিত হয়
              Minar Academy—বাংলাদেশের প্রথম পূর্ণাঙ্গ ডিজিটাল ই-লার্নিং
              প্ল্যাটফর্ম, যা মাদ্রাসা শিক্ষার্থীদের জন্য বিশেষভাবে তৈরি।
            </p>
            <p className="text-base text-justify">
              তিনি একজন দক্ষ ডিজিটাল মার্কেটিং স্ট্র্যাটেজিস্ট ও এডুটেক ইনোভেটর।
              তাঁর নেতৃত্বে Minar Academy আজ পরিণত হয়েছে একটি আস্থাভাজন শিক্ষা
              প্ল্যাটফর্মে, যা মাদ্রাসার গণ্ডি পেরিয়ে স্কুল ও কলেজ শিক্ষার্থীদের
              মাঝেও জনপ্রিয় হয়ে উঠেছে।
            </p>
            <p className="text-base text-justify">
              আজ Minar Academy মানেই—স্মার্ট, সহজলভ্য ও ভবিষ্যতমুখী শিক্ষা।
            </p>
            <p className="text-base text-justify italic">
              “যেখানে প্রযুক্তি নেই, সেখানেই সীমাবদ্ধতা জন্ম নেয় Minar Academy-র
              মাধ্যমে আমি সেই সীমা ভাঙতে চেয়েছি— যাতে মাদ্রাসা শিক্ষার্থীরাও
              বিশ্বমানের কন্টেন্ট ও পদ্ধতিতে শিখতে পারে। শুধু জিপিএ নয়, তাদের
              মধ্যে গড়ে উঠুক আত্মবিশ্বাস, নৈতিকতা ও বিশ্লেষণী মন। আমার বিশ্বাস,
              এভাবেই তারা তৈরি হবে আগামী দিনের দক্ষ ও মানবিক নাগরিক হিসেবে।”
            </p>
            <p className="font-semibold">MD Mainuddin Hassan</p>
            <p className="text-sm text-gray-600">
              Founder & CEO of Minar Academy
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
