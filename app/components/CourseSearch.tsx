import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import SafeImage from "@/app/components/SafeImage";
import Link from "next/link";

export default function CourseSearch() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<CourseDetails[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom debounce using ref for timer id
  const debounceTimeout = useRef<number | null>(null);

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await axiosInstance.get("/course/search", {
        params: { search: searchTerm },
        headers: {
          "Content-Type": "application/json",
          "app-key": process.env.NEXT_PUBLIC_APP_KEY,
        },
      });
      setResults(res.data.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }
  };

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = window.setTimeout(() => {
      fetchResults(value);
    }, 500);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-72 border focus-within:border-primary rounded-md flex items-center px-2"
    >
      <Search className="w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search"
        className="ml-2 py-1.5 w-full text-sm outline-none"
        value={query}
        onChange={onChangeHandler}
        onFocus={() => {
          if (results.length) setShowDropdown(true);
        }}
      />

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {results.map((course) => (
            <Link href={`/course/${course.slug}`}>
              <li
                key={course.id}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setQuery(course.title);
                  setShowDropdown(false);
                }}
              >
                <SafeImage
                  src={course.featured_image}
                  alt={course.title}
                  className="w-8 h-8 object-cover rounded"
                  width={1080}
                  height={1080}
                />
                <span className="truncate text-sm">{course.title}</span>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}
