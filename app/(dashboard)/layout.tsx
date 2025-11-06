import React, { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PhoneMenu from "../components/PhoneMenu";
import { auth } from "@/lib/auth";
import UserGreeting from "../components/dashboard/new/UserGreeting";
import SidebarNavigation from "../components/dashboard/new/SidebarNavigation";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div>
      <Header session={session} />
      <PhoneMenu session={session} />
      <div className="wrapper">
        <UserGreeting session={session} />
        <div className="flex">
          <SidebarNavigation />
          <div className="w-full px-4 py-4">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
