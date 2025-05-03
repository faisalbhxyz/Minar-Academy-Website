import SingleResource from "@/app/components/resource/SingleResource";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <div className="wrapper flex gap-2 py-3">
        <Link href="/resource" className="text-primary">
          Home
        </Link>
        <span>›</span>
        <Link href="/resource" className="text-primary">
          একাডেমিক পড়াশোনার সবকিছু
        </Link>
        <span>›</span>
        <Link href="/resource" className="text-primary">
          HSC
        </Link>
        <span>›</span>
        <Link href="/resource" className="text-primary">
          Bangla
        </Link>
        <span>›</span>
        <Link href="/resource" className="text-primary">
          Bangla 1st Paper
        </Link>
        <span>›</span>
        <span>অপরিচিতা</span>
      </div>
      <SingleResource />
    </>
  );
}
