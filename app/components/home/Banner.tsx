import Image from "next/image";
import React from "react";

export default function Banner() {
  return (
    <div className="relative h-96 md:h-[500px] w-full overflow-hidden rounded-t-xl">
      <Image
        src="/images/thumbnail.png"
        alt="Full banner image"
        fill
        className="object-contain object-center"
        priority
        sizes="100vw"
      />
    </div>
  );
}
