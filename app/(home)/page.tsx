import React from "react";
import Banner from "../components/home/Banner";
import Course from "../components/home/Course";
import FreeClasses from "../components/home/FreeClasses";
import MinarAcademy from "../components/home/MinarAcademy";
import NewsLetter from "../components/home/NewsLetter";
import MoreTips from "../components/home/MoreTips";
import AboutMinarAcademy from "../components/home/AboutMinarAcademy";

export default function HomePage() {
  return (
    <>
      <Banner />
      <Course />
      <FreeClasses />
      <MinarAcademy />
      <NewsLetter />
      <MoreTips />
      <AboutMinarAcademy />
    </>
  );
}
