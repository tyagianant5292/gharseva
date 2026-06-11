import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import MyRequests from "@/components/MyRequests";

export const metadata = { title: "My Requests — GharSeva" };

export default async function RequestsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/requests");
  return <MyRequests />;
}
