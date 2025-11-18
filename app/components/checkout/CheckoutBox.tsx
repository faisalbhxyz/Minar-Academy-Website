"use client";
import { getPaymentMethods } from "@/app/actions";
import useOrderStore from "@/hooks/useOrderStore";
import axiosInstance from "@/lib/axiosInstance";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutBox({ session }: { session: Session }) {
  const router = useRouter();
  const { item, clearItem, setOrder } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<IPaymentMethod | null>(null);
  const [transaction_id, setTransactionId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<IPaymentMethod[]>([]);
  useEffect(() => {
    getPaymentMethods().then((res) => {
      setPaymentMethod(res);
    });
  }, []);

  const handleCheckout = () => {
    if (
      paymentMethod &&
      paymentMethod.length > 0 &&
      (!transaction_id || transaction_id == "")
    ) {
      toast.error("Please select a payment method and provide transaction id");
      return;
    }
    if (loading) return;
    setLoading(true);
    axiosInstance
      .post(
        "/order/create",
        {
          course_id: item?.id,
          payment_method: selectedPaymentMethod
            ? selectedPaymentMethod.title
            : null,
          transaction_id:
            paymentMethod && paymentMethod.length > 0 ? transaction_id : null,
        },
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
          payment_method: selectedPaymentMethod
            ? selectedPaymentMethod.title
            : null,
          transaction_id:
            paymentMethod && paymentMethod.length > 0 ? transaction_id : null,
        });
        setLoading(false);
        setTransactionId(null);
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

      <div className="flex flex-col gap-2">
        {paymentMethod.map((method) => (
          <div className="flex items-center gap-2" key={method.id}>
            <input
              id={method.title}
              type="radio"
              name="payment_method"
              value={method.id}
              onChange={(e) => setSelectedPaymentMethod(method)}
              checked={selectedPaymentMethod?.id === method.id}
            />
            <label htmlFor={method.title}>{method.title}</label>
          </div>
        ))}

        {paymentMethod.length > 0 && selectedPaymentMethod && (
          <div className="mt-4">
            <label htmlFor="transaction_id" className="mb-2 block">
              {selectedPaymentMethod.instruction}
            </label>
            <input
              name="transaction_id"
              id="transaction_id"
              type="text"
              className="w-full border border-primary rounded-lg px-3 py-2 focus:outline-none"
              value={transaction_id || ""}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
        )}
      </div>

      <button
        className="mt-4 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition duration-200"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Processing..." : "Confirm Checkout"}
      </button>
    </div>
  );
}
