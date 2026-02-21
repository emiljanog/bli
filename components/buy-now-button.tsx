"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addItemToCart } from "@/lib/cart";

type BuyNowButtonProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  className?: string;
};

export function BuyNowButton({ productId, name, price, image, className }: BuyNowButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  if (price <= 0) return null;

  const handleClick = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await addItemToCart({
        id: productId,
        name,
        price,
        image,
        quantity: 1,
      });
      router.push("/checkout");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isPending}
      className={`${className ?? ""} cursor-pointer disabled:cursor-not-allowed`}
    >
      {isPending ? "Duke vazhduar..." : "Bli tani"}
    </button>
  );
}

