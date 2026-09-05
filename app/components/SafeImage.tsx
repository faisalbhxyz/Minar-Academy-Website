"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { mediaUrlCandidates } from "@/lib/mediaUrl";

const PLACEHOLDER = "/images/placeholder.svg";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
  fallbackSrc?: string;
};

function shouldBypassOptimizer(src: string): boolean {
  return (
    src.includes("b-cdn.net") ||
    src.includes("bunnycdn.com") ||
    src.includes("r2.dev") ||
    src.startsWith("/images/")
  );
}

export default function SafeImage({
  src,
  fallbackSrc = PLACEHOLDER,
  alt,
  className,
  ...rest
}: SafeImageProps) {
  const candidates = mediaUrlCandidates(src);
  const initial =
    candidates[0] ||
    (src && src.trim().length > 0 ? src.trim() : fallbackSrc);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const nextCandidates = mediaUrlCandidates(src);
    const next =
      nextCandidates[0] ||
      (src && src.trim().length > 0 ? src.trim() : fallbackSrc);
    setCandidateIndex(0);
    setCurrentSrc(next);
    setFailed(false);
  }, [src, fallbackSrc]);

  const resolvedSrc = failed ? fallbackSrc : currentSrc;
  const unoptimized =
    rest.unoptimized === true || shouldBypassOptimizer(resolvedSrc);

  return (
    <Image
      {...rest}
      src={resolvedSrc}
      alt={alt}
      className={className}
      unoptimized={unoptimized}
      onError={() => {
        const nextCandidates = mediaUrlCandidates(src);
        const nextIndex = candidateIndex + 1;
        if (nextIndex < nextCandidates.length) {
          setCandidateIndex(nextIndex);
          setCurrentSrc(nextCandidates[nextIndex]);
          return;
        }
        if (!failed && resolvedSrc !== fallbackSrc) {
          setFailed(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
