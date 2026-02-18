import { redirect } from "next/navigation";

export default async function RegisterPage() {
  redirect("/login?tab=register");
}
