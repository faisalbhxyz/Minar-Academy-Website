"use client";
import useOrderStore from "@/hooks/useOrderStore";
import axiosInstance from "@/lib/axiosInstance";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export default function CheckoutBox({ session }: { session: Session }) {
  const router = useRouter();
  const { item, clearItem, setOrder } = useOrderStore();

  const handleCheckout = () => {
    axiosInstance
      .post(
        "/order/create",
        { course_id: item?.id },
        {
          headers: {
            "Content-Type": "application/json",
            "app-key": process.env.NEXT_PUBLIC_APP_KEY,
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
        setOrder({
          title: item?.title!,
          course_id: res.data.order.course_id,
          customer_note: res.data.order.customer_note,
          invoice_id: res.data.order.invoice_id,
          total: res.data.order.total,
        });
        clearItem();
        router.push("/thank-you");
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      });
  };

  return (
    <div className="w-[350px] border border-primary rounded-md p-5 flex flex-col justify-between items-stretch">
      {item?.pricing_model === "free" && (
        <p className="text-xl font-medium mb-2 text-center">Total: &#2547; 0</p>
      )}
      {item?.pricing_model === "paid" && (
        <p className="text-xl font-medium mb-2 text-center">
          Total: &#2547;
          {item.sale_price && item.sale_price > 0
            ? item.sale_price
            : item.regular_price}
        </p>
      )}
      <button
        className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition duration-200"
        onClick={handleCheckout}
      >
        Confirm Checkout
      </button>
    </div>
  );
}
