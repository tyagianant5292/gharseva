"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn-outline" title="Log out">
      <LogOut size={15} />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
