"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Mail, Phone, Trash2, ShieldCheck } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
  contactsUnlocked: number;
};

export default function AdminCustomers() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    const d = await res.json();
    setRows(d.customers || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function del(id: string, name: string) {
    if (!window.confirm(`Delete ${name}'s account permanently?`)) return;
    setActing(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Could not delete");
    }
    setActing(null);
    load();
  }

  if (loading) return <p className="mt-6 text-slate-500">Loading…</p>;

  return (
    <div className="mt-5">
      <p className="text-sm text-slate-500">{rows.length} customer account(s)</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-slate-500">No customers yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Contact</th>
                <th className="py-2 pr-4 font-medium">Email status</th>
                <th className="py-2 pr-4 font-medium">Unlocked</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-slate-800">{c.name}</span>
                    {c.role === "ADMIN" && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                        <ShieldCheck size={11} /> Admin
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" /> {c.mobile}
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail size={11} className="text-slate-400" /> {c.email}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {!c.email ? (
                      <span className="text-xs text-slate-400">no email</span>
                    ) : c.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                        <BadgeCheck size={12} /> verified
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600">unverified</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{c.contactsUnlocked}</td>
                  <td className="py-3 pr-4 text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => del(c.id, c.name)}
                      disabled={acting === c.id || c.role === "ADMIN"}
                      title={c.role === "ADMIN" ? "Admins can't be deleted here" : "Delete"}
                      className="btn px-2.5 py-1 text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
