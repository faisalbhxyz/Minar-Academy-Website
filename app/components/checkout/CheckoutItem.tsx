"use client";
import useOrderStore from "@/hooks/useOrderStore";
import React from "react";
import SafeImage from "@/app/components/SafeImage";

export default function CheckoutItem() {
  const { item } = useOrderStore();

  if (item == null) {
    return;
  }

  return (
    <>
      <div className="border border-primary p-4 w-fit rounded-md">
        <div className="mb-2">
          <SafeImage
            src={item?.featured_image}
            alt={item?.title || "Course image"}
            width={300}
            height={300}
            className="object-scale-down"
          />
        </div>
        <div>
          <p className="text-base font-medium">{item?.title}</p>
          {item && item?.pricing_model == "paid" ? (
            <p className="font-semibold text-xl">
              {item.sale_price && item.sale_price > 0 && (
                <span className="line-through text-gray-500">
                  &#2547;{item.regular_price}
                </span>
              )}{" "}
              <span>
                &#2547;
                {item.sale_price && item.sale_price > 0
                  ? item.sale_price
                  : item.regular_price}
              </span>
            </p>
          ) : (
            <p className="font-semibold text-xl">Free</p>
          )}
        </div>
      </div>
    </>
  );
}
