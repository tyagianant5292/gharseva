import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AccountForm from "@/components/AccountForm";

export const metadata = { title: "My Account — GharSeva" };

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  return <AccountForm />;
}
