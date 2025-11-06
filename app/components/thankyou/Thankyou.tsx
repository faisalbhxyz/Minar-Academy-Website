"use client";
import useOrderStore from "@/hooks/useOrderStore";
import React from "react";

export default function Thankyou() {
  const { order } = useOrderStore();

  if (order == null) return;

  return (
    <div className="text-center font-medium">
      <p className="text-2xl font-semibold">Thank you for your order.</p>
      <p className="mt-2 text-lg">
        You have purchased {order?.title} for &#2547;{order?.total} and your
        invoice id is #00000{order?.invoice_id}
      </p>
    </div>
  );
}
