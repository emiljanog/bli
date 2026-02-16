import { redirect } from "next/navigation";
import { listProducts } from "@/lib/shop-store";

export default function ProductIndexPage() {
  const products = listProducts();
  const targetProductSlug = products[0]?.slug;

  if (!targetProductSlug) {
    redirect("/shop");
  }

  redirect(`/product/${targetProductSlug}`);
}
