import React, { ReactNode } from "react";
import CoursesMenu from "./CoursesMenu";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <CoursesMenu />
      {children}
    </div>
  );
}
