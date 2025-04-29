import React from "react";
import Banner from "../components/home/Banner";
import Course from "../components/home/Course";
import FreeClasses from "../components/home/FreeClasses";
import MinarAcademy from "../components/home/MinarAcademy";

export default function HomePage() {
  return (
    <>
      <Banner />
      <Course />
      <FreeClasses />
      <MinarAcademy />
    </>
  );
}
