"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Phone, Check, X, Clock, CalendarDays } from "lucide-react";
import { serviceLabel } from "@/lib/services";
import { formatMoney } from "@/lib/money";

type Status = "PENDING" | "ACCEPTED" | "DECLINED";
type Booking = {
  id: string;
  providerId: string;
  providerName: string;
  providerArea: string;
  country?: string | null;
  providerMobile: string | null;
  service: string;
  startDate: string;
  endDate: string;
  days: number;
  ratePerDay: number;
  totalAmount: number;
  status: Status;
  responseNote: string | null;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function MyInstantBookings() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instant/my");
      const d = await res.json();
      setRows(d.bookings || []);
      setLoading(false);
    })();
  }, []);

  if (loading || rows.length === 0) return null;

  const pill: Record<Status, { cls: string; icon: React.ReactNode; label: string }> = {
    PENDING: { cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: <Clock size={12} />, label: "Pending" },
    ACCEPTED: { cls: "bg-teal-50 text-teal-700 ring-teal-200", icon: <Check size={12} />, label: "Accepted" },
    DECLINED: { cls: "bg-red-50 text-red-700 ring-red-200", icon: <X size={12} />, label: "Declined" },
  };

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Zap size={18} className="fill-amber-500 text-amber-500" /> Daily bookings
      </h2>
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between">
              <Link href={`/providers/${r.providerId}`} className="font-semibold text-slate-900 hover:text-brand-600">{r.providerName}</Link>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${pill[r.status].cls}`}>
                {pill[r.status].icon} {pill[r.status].label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{r.providerArea}</p>
            <p className="mt-1 text-sm text-slate-600">Service: {serviceLabel(r.service)}</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
              <CalendarDays size={13} /> {fmtDate(r.startDate)} → {fmtDate(r.endDate)} · {r.days} {r.days === 1 ? "day" : "days"}
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {formatMoney(r.totalAmount, r.country)} <span className="font-normal text-slate-400">(cash on arrival)</span>
            </p>
            {r.status === "ACCEPTED" && r.providerMobile && (
              <a href={`tel:${r.providerMobile}`} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200">
                <Phone size={14} /> Call {r.providerMobile}
              </a>
            )}
            {r.status === "DECLINED" && (
              <>
                {r.responseNote && (
                  <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                    <span className="font-semibold">Reason:</span> {r.responseNote}
                  </p>
                )}
                <Link href={`/instant`} className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">
                  Find another helper →
                </Link>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
