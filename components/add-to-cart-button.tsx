"use client";

import { useEffect, useRef, useState } from "react";
import { addItemToCart, openCartDrawer } from "@/lib/cart";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  className?: string;
};

export function AddToCartButton({ productId, name, price, image, className }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
      openCartDrawer();

      setIsAdded(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsAdded(false), 1200);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className={`${className ?? ""} cursor-pointer disabled:cursor-not-allowed`}
      disabled={isPending}
    >
      {isAdded ? "Added" : isPending ? "Adding..." : "Add to cart"}
    </button>
  );
}
