import { redirect } from "next/navigation";

export default async function RegisterAccountRedirectPage() {
  redirect("/dashboard/users");
}
