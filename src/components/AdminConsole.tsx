"use client";

import { useState } from "react";
import { Users, HardHat } from "lucide-react";
import AdminPanel from "./AdminPanel";
import AdminCustomers from "./AdminCustomers";

export default function AdminConsole() {
  const [view, setView] = useState<"helpers" | "customers">("helpers");

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin console</h1>
      <p className="mt-1 text-slate-500">All sign-ups — helpers and customers.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 sm:max-w-md">
        <button
          onClick={() => setView("helpers")}
          className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors ${
            view === "helpers" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
          }`}
        >
          <HardHat size={16} /> Helpers
        </button>
        <button
          onClick={() => setView("customers")}
          className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors ${
            view === "customers" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
          }`}
        >
          <Users size={16} /> Customers
        </button>
      </div>

      <div className="mt-6">{view === "helpers" ? <AdminPanel /> : <AdminCustomers />}</div>
    </div>
  );
}
