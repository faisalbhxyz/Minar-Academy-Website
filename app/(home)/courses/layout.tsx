import React, { ReactNode } from "react";
import CoursesMenu from "./CoursesMenu";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CoursesMenu />
      {children}
    </>
  );
}
