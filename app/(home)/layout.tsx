import React, { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PhoneMenu from "../components/PhoneMenu";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      <PhoneMenu />
      {children}
      <Footer />
    </div>
  );
}
