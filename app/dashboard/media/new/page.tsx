import { redirect } from "next/navigation";

export default function AdminNewMediaPage() {
  redirect("/dashboard/media?upload=1");
}
