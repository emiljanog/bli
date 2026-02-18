import { redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/shop-store";

type ProductBySlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductBySlugPage({ params }: ProductBySlugPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    redirect("/dashboard/products");
  }

  redirect(`/dashboard/products/${product.id}`);
}
