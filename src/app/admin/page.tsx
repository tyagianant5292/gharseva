import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import AdminConsole from "@/components/AdminConsole";

export const metadata = { title: "Admin — GharSeva" };

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdmin(user)) {
    return (
      <div className="container-x max-w-xl py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-slate-500">This area is for administrators only.</p>
      </div>
    );
  }
  return <AdminConsole />;
}
