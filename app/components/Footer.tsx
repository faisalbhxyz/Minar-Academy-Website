import React from "react";
import Link from "next/link";
import { FaFacebookF } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import Image from "next/image";
import { MdEmail, MdLocationPin, MdPhone } from "react-icons/md";
import { GrInstagram } from "react-icons/gr";
import { SiTiktok } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-6 py-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <Image
            src={"/images/minar-academy-logo.png"}
            alt={"logo"}
            width={200}
            height={100}
            className="w-32 -ml-3"
          />
          <p className="mt-3">
            Minar Academy – Making Madrasah education smarter and more
            accessible through technology.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">লিঙ্ক</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/">আমাদের সম্পর্কে</Link>
            </li>
            <li>
              <Link href="/about">ক্যারিয়ার</Link>
            </li>
            <li>
              <Link href="/courses">স্কিলস</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">যোগাযোগ</h3>
          <div className="flex items-center gap-2 mb-3">
            <MdEmail size={22} />
            <span>minaracademy@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <MdPhone size={22} />{" "}
            <Link href="tel:01886929763">01886929763</Link>
          </div>
          <div className="flex items-center gap-2">
            <span>
              <MdLocationPin size={22} />
            </span>
            <span>Abdullah Khan Lane, Boro Garage, Badurtola, Chittagong</span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            আমাদের সাথে কানেক্টেড থাকো
          </h3>
          <div className="flex space-x-4">
            <Link href="https://www.facebook.com/people/Minar-Academy/61574272148754/">
              <span className="bg-white w-9 h-9 rounded-md text-sky-600 flex items-center justify-center">
                <FaFacebookF size={22} />
              </span>
            </Link>
            <Link href="https://www.youtube.com/@MinarAcademy">
              <span className="bg-white w-9 h-9 rounded-md text-red-600 flex items-center justify-center">
                <FaYoutube size={22} />
              </span>
            </Link>
            <Link href="https://www.instagram.com/minaracademy/">
              <span className="bg-white w-9 h-9 rounded-md text-sky-600 flex items-center justify-center">
                <GrInstagram size={22} />
              </span>
            </Link>
            <Link href="https://www.tiktok.com/@minar.academy">
              <span className="bg-white w-9 h-9 rounded-md text-sky-600 flex items-center justify-center">
                <SiTiktok size={22} />
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto border-t border-gray-700 pt-4 flex flex-col md:flex-row items-center justify-between text-sm">
        <div className="space-x-3">
          <Link href="/terms">
            <span className="hover:underline">Terms & Conditions</span>
          </Link>
          <Link href="/terms">
            <span className="hover:underline">Refund Policy</span>
          </Link>
          <Link href="/terms">
            <span className="hover:underline">Privacy Policy</span>
          </Link>
        </div>
        <p className="mt-2 md:mt-0">
          © {new Date().getFullYear()} Minar Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
