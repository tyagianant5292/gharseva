"use client";

import { useState } from "react";
import { Users, HardHat, ShieldCheck } from "lucide-react";
import AdminPanel from "./AdminPanel";
import AdminCustomers from "./AdminCustomers";

export default function AdminConsole() {
  const [view, setView] = useState<"helpers" | "customers">("helpers");

  const nav = [
    { key: "helpers" as const, label: "Helpers", icon: <HardHat size={16} />, sub: "Verify & manage" },
    { key: "customers" as const, label: "Customers", icon: <Users size={16} />, sub: "All sign-ups" },
  ];

  return (
    <div className="container-x py-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Admin console</p>
              <p className="text-xs text-slate-500">GharSeva</p>
            </div>
          </div>

          <nav className="card p-2">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  view === n.key ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {n.icon}
                <span>
                  <span className="block text-sm font-medium">{n.label}</span>
                  <span className="block text-xs text-slate-400">{n.sub}</span>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900">{view === "helpers" ? "Helpers" : "Customers"}</h1>
          {view === "helpers" ? <AdminPanel /> : <AdminCustomers />}
        </main>
      </div>
    </div>
  );
}
