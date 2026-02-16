"use client";

import { useEffect, useRef, useState } from "react";
import { addItemToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  className?: string;
};

export function AddToCartButton({ productId, name, price, image, className }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    addItemToCart({
      id: productId,
      name,
      price,
      image,
      quantity: 1,
    });

    setIsAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {isAdded ? "Added" : "Add to cart"}
    </button>
  );
}
