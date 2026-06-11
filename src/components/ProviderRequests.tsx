"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, Phone, Mail, Check, X, Clock } from "lucide-react";
import { serviceLabel } from "@/lib/services";

type Status = "PENDING" | "ACCEPTED" | "DECLINED";
type Req = {
  id: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string | null;
  service: string | null;
  message: string | null;
  preferredTime: string | null;
  status: Status;
  createdAt: string;
};

export default function ProviderRequests() {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/provider/requests");
    const d = await res.json();
    setRows(d.requests || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "accept" | "decline") {
    setActing(id);
    await fetch(`/api/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActing(null);
    load();
  }

  if (loading || rows.length === 0) return null; // hide section when there's nothing

  const pillCls: Record<Status, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    ACCEPTED: "bg-teal-50 text-teal-700 ring-teal-200",
    DECLINED: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <div className="mt-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Inbox size={16} /> Booking requests ({rows.length})
      </h2>
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{r.customerName}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${pillCls[r.status]}`}>
                    {r.status === "PENDING" ? <Clock size={11} /> : r.status === "ACCEPTED" ? <Check size={11} /> : <X size={11} />}
                    {r.status.toLowerCase()}
                  </span>
                </div>
                {r.service && <p className="mt-0.5 text-sm text-slate-600">Needs: {serviceLabel(r.service)}</p>}
                {r.preferredTime && <p className="text-sm text-slate-500">Time: {r.preferredTime}</p>}
                {r.message && <p className="mt-1 text-sm text-slate-600">“{r.message}”</p>}
                {/* Contact shown so the provider can respond */}
                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-slate-500">
                  <a href={`tel:${r.customerMobile}`} className="flex items-center gap-1 hover:text-brand-600">
                    <Phone size={12} /> {r.customerMobile}
                  </a>
                  {r.customerEmail && (
                    <a href={`mailto:${r.customerEmail}`} className="flex items-center gap-1 hover:text-brand-600">
                      <Mail size={12} /> {r.customerEmail}
                    </a>
                  )}
                </p>
              </div>
              {r.status === "PENDING" && (
                <div className="flex gap-2">
                  <button onClick={() => act(r.id, "accept")} disabled={acting === r.id} className="btn bg-teal-600 px-3 py-1.5 text-white hover:bg-teal-700 disabled:opacity-50">
                    <Check size={15} /> Accept
                  </button>
                  <button onClick={() => act(r.id, "decline")} disabled={acting === r.id} className="btn border border-red-200 bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 disabled:opacity-50">
                    <X size={15} /> Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
