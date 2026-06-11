"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Check, X, Clock, Phone, Mail, MapPin, Power, Trash2, EyeOff } from "lucide-react";
import { serviceLabel } from "@/lib/services";

type Row = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  services: string[];
  city: string;
  locality: string;
  pincode: string;
  experienceYears: number;
  available: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verificationNote: string | null;
  idDocType: string | null;
  idDocUrl: string | null;
  idDocBackUrl: string | null;
  photoUrl: string | null;
};

function isPdf(url: string) {
  return url.startsWith("data:application/pdf");
}

function DocThumb({ url, label, onZoom }: { url: string; label: string; onZoom: (u: string) => void }) {
  return (
    <div>
      <span className="block text-xs text-slate-400">{label}</span>
      {isPdf(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-16 w-24 place-items-center rounded bg-slate-100 text-xs font-medium text-brand-600 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          📄 View PDF
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={label}
          onClick={() => onZoom(url)}
          className="h-16 w-24 cursor-zoom-in rounded object-cover ring-1 ring-slate-200"
        />
      )}
    </div>
  );
}

const TABS = ["PENDING", "VERIFIED", "REJECTED", "ALL"] as const;

export default function AdminPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("PENDING");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/providers?status=${tab}`);
    const d = await res.json();
    setRows(d.providers || []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject" | "enable" | "disable") {
    let note: string | undefined;
    if (action === "reject") {
      note = window.prompt("Reason for rejection (shown to the provider):") || undefined;
    }
    setActing(id);
    await fetch(`/api/admin/providers/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    setActing(null);
    load();
  }

  async function del(id: string, name: string) {
    if (!window.confirm(`Delete ${name}'s account permanently? This cannot be undone.`)) return;
    setActing(id);
    await fetch(`/api/admin/providers/${id}`, { method: "DELETE" });
    setActing(null);
    load();
  }

  return (
    <div>
      <p className="text-sm text-slate-500">Review helper documents and manage their profiles.</p>

      <div className="mt-4 flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
            }`}
          >
            {t.toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-slate-500">No providers in this list.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-3">
                  {r.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photoUrl}
                      alt={r.name}
                      onClick={() => setZoom(r.photoUrl)}
                      className="h-14 w-14 cursor-zoom-in rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                      {r.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{r.name}</h3>
                      <StatusPill status={r.verificationStatus} />
                      {!r.available && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                          <EyeOff size={12} /> Disabled
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={12} /> {r.locality}, {r.city} · {r.pincode}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Phone size={12} /> {r.mobile}</span>
                      <span className="flex items-center gap-1"><Mail size={12} /> {r.email}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {r.services.map(serviceLabel).join(", ")} · {r.experienceYears} yr exp
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {r.idDocUrl ? (
                    <div className="flex items-center gap-2">
                      <DocThumb url={r.idDocUrl} label={`${r.idDocType || "ID"} · front`} onZoom={setZoom} />
                      {r.idDocBackUrl && <DocThumb url={r.idDocBackUrl} label="back" onZoom={setZoom} />}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No ID uploaded</span>
                  )}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => act(r.id, "approve")}
                      disabled={acting === r.id || r.verificationStatus === "VERIFIED"}
                      className="btn bg-teal-600 px-3 py-1.5 text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      <Check size={15} /> Approve
                    </button>
                    <button
                      onClick={() => act(r.id, "reject")}
                      disabled={acting === r.id || r.verificationStatus === "REJECTED"}
                      className="btn border border-red-200 bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      <X size={15} /> Reject
                    </button>
                    <button
                      onClick={() => act(r.id, r.available ? "disable" : "enable")}
                      disabled={acting === r.id}
                      className="btn border border-slate-300 bg-white px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Power size={15} /> {r.available ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => del(r.id, r.name)}
                      disabled={acting === r.id}
                      className="btn px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              </div>
              {r.verificationNote && (
                <p className="mt-2 text-xs text-red-500">Note: {r.verificationNote}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* zoom overlay */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-black/70 p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="document" className="max-h-[90vh] max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Row["verificationStatus"] }) {
  const map = {
    PENDING: { cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: <Clock size={12} />, label: "Pending" },
    VERIFIED: { cls: "bg-teal-50 text-teal-700 ring-teal-200", icon: <BadgeCheck size={12} />, label: "Verified" },
    REJECTED: { cls: "bg-red-50 text-red-700 ring-red-200", icon: <X size={12} />, label: "Rejected" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${map.cls}`}>
      {map.icon} {map.label}
    </span>
  );
}
