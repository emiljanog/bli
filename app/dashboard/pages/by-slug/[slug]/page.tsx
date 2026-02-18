import { redirect } from "next/navigation";
import { getPageBySlug } from "@/lib/shop-store";

type PageBySlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PageBySlugPage({ params }: PageBySlugPageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    redirect("/dashboard/pages");
  }

  redirect(`/dashboard/pages/${page.id}`);
}
