import Thankyou from "@/app/components/thankyou/Thankyou";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }
  return (
    <div className="flex justify-center items-center h-screen text-center p-4">
      <Thankyou />
    </div>
  );
}
