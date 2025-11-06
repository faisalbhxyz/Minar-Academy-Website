import React from "react";
import Banner from "../components/home/Banner";
import Course from "../components/home/Course";
import FreeClasses from "../components/home/FreeClasses";
import MinarAcademy from "../components/home/MinarAcademy";
import NewsLetter from "../components/home/NewsLetter";
import MoreTips from "../components/home/MoreTips";
import AboutMinarAcademy from "../components/home/AboutMinarAcademy";
import axiosInstance from "@/lib/axiosInstance";
import { getAllCategories, getAllCourses } from "../actions";

const getAllBanners = async () => {
  try {
    const res = await axiosInstance.get("/banners", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default async function HomePage() {
  const banner = await getAllBanners();
  const courses = await getAllCourses(12);
  const categories = await getAllCategories();

  return (
    <>
      <Banner banners={banner} />
      <Course courses={courses} categories={categories}/>
      <FreeClasses />
      <MinarAcademy />
      <NewsLetter />
      <MoreTips />
      <AboutMinarAcademy />
    </>
  );
}
