import Image from "next/image";
import React from "react";
import { FaFilePdf } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";

export default function SingleResource() {
  return (
    <div className="wrapper py-10 flex flex-col md:flex-row items-start gap-5">
      <div className="w-full border flex h-[32rem] bg-gray-100 rounded-xl">
        <div className="w-28 min-w-28 md:w-40 md:min-w-40 h-full overflow-y-auto p-4">
          <Image
            src={"/images/Screenshot_5_1741766795968.png"}
            alt={"image"}
            width={1000}
            height={1000}
            className="w-full h-auto"
          />
        </div>
        <div className="h-full w-full overflow-y-auto p-4">
          <Image
            src={"/images/Screenshot_5_1741766795968.png"}
            alt={"image"}
            width={1000}
            height={1000}
            className="w-full h-auto"
          />
          <p className="text-center">
            বাকি পৃষ্ঠাগুলি পড়তে PDF টি{" "}
            <span className="text-primary">ডাউনলোড করুন</span>
          </p>
        </div>
      </div>

      <div className="w-full md:w-96 md:min-w-96 border p-5">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <span className="text-red-500 bg-red-100 p-2 rounded-full">
            <FaFilePdf size={33} />
          </span>
          <div>
            <p>অপরিচিতা</p>
            <p className="text-sm">1324974</p>
          </div>
        </div>
        <div className="space-y-3 py-4 border-b border-gray-200">
          <div>
            <p>HSC</p>
          </div>
          <div>
            <p>Bangla</p>
          </div>
          <div>
            <p>Bangla 1st Paper</p>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 my-4 px-6 py-2 text-white bg-primary rounded">
          <MdOutlineFileDownload size={23} /> ডাউনলোড করুন
        </button>
      </div>
    </div>
  );
}
