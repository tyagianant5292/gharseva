import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import DashboardForm from "@/components/DashboardForm";

export const metadata = { title: "My Profile — GharSeva" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  if (user.role !== "PROVIDER") {
    return (
      <div className="container-x max-w-xl py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">This page is for helpers</h1>
        <p className="mt-2 text-slate-500">
          You&apos;re signed in as a customer. Browse helpers instead, or register a helper account.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/providers" className="btn-primary">
            Find Helpers
          </Link>
        </div>
      </div>
    );
  }

  return <DashboardForm />;
}
