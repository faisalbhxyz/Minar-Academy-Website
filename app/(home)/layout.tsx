import React, { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
