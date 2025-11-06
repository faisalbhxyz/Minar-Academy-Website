import React, { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PhoneMenu from "../components/PhoneMenu";
import { auth } from "@/lib/auth";
import ContactFloatingButton from "../components/ContactFloatingBtn";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <div>
      <Header session={session} />
      <PhoneMenu session={session} />
      {children}
      <Footer />
      <ContactFloatingButton />
    </div>
  );
}
