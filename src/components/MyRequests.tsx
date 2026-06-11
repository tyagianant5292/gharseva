"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Check, X, Clock } from "lucide-react";
import { serviceLabel } from "@/lib/services";

type Status = "PENDING" | "ACCEPTED" | "DECLINED";
type Req = {
  id: string;
  providerId: string;
  providerName: string;
  providerArea: string;
  providerMobile: string | null;
  service: string | null;
  message: string | null;
  preferredTime: string | null;
  status: Status;
  createdAt: string;
};

export default function MyRequests() {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/my-requests");
      const d = await res.json();
      setRows(d.requests || []);
      setLoading(false);
    })();
  }, []);

  const pill: Record<Status, { cls: string; icon: React.ReactNode; label: string }> = {
    PENDING: { cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: <Clock size={12} />, label: "Pending" },
    ACCEPTED: { cls: "bg-teal-50 text-teal-700 ring-teal-200", icon: <Check size={12} />, label: "Accepted" },
    DECLINED: { cls: "bg-red-50 text-red-700 ring-red-200", icon: <X size={12} />, label: "Declined" },
  };

  return (
    <div className="container-x max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-slate-900">My requests</h1>
      <p className="mt-1 text-slate-500">Booking requests you&apos;ve sent to helpers.</p>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-slate-600">You haven&apos;t sent any requests yet.</p>
          <Link href="/providers" className="btn-primary mt-4">
            Find helpers
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <Link href={`/providers/${r.providerId}`} className="font-semibold text-slate-900 hover:text-brand-600">
                  {r.providerName}
                </Link>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${pill[r.status].cls}`}>
                  {pill[r.status].icon} {pill[r.status].label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">{r.providerArea}</p>
              {r.service && <p className="mt-1 text-sm text-slate-600">Service: {serviceLabel(r.service)}</p>}
              {r.preferredTime && <p className="text-sm text-slate-500">Time: {r.preferredTime}</p>}
              {r.status === "ACCEPTED" && r.providerMobile && (
                <a href={`tel:${r.providerMobile}`} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200">
                  <Phone size={14} /> Call {r.providerMobile}
                </a>
              )}
              {r.status === "DECLINED" && (
                <Link href={`/providers/${r.providerId}`} className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">
                  Send a new request →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
