import React, { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Header from "@/app/components/Header";
import PhoneMenu from "@/app/components/PhoneMenu";
import UserGreeting from "@/app/components/dashboard/new/UserGreeting";
import SidebarNavigation from "@/app/components/dashboard/new/SidebarNavigation";
import Footer from "@/app/components/Footer";

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
        {/* <UserGreeting session={session} /> */}
        <div className="flex">
          <div className="w-full">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
