import CheckoutBox from "@/app/components/checkout/CheckoutBox";
import CheckoutItem from "@/app/components/checkout/CheckoutItem";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login?redirect=checkout");
  }
  return (
    <div className="p-4 wrapper flex gap-8 items-stretch justify-center">
      <CheckoutItem />
      <CheckoutBox session={session} />
    </div>
  );
}
