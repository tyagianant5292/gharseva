"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Clock, Check, X } from "lucide-react";
import { displayService } from "@/lib/services";

type Status = "PENDING" | "ACCEPTED" | "DECLINED";
type MyRequest = { status: Status; service: string | null; message: string | null; preferredTime: string | null; responseNote?: string | null };

export default function RequestHelperButton({
  providerId,
  providerName,
  services,
  otherService,
  canRequest,
  loggedIn,
  initialRequest,
  onChange,
}: {
  providerId: string;
  providerName: string;
  services: string[];
  otherService?: string | null;
  canRequest: boolean;
  loggedIn: boolean;
  initialRequest: MyRequest | null;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState(initialRequest?.service || services[0] || "");
  const [message, setMessage] = useState(initialRequest?.message || "");
  const [preferredTime, setPreferredTime] = useState(initialRequest?.preferredTime || "");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/providers/${providerId}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, message: message.trim() || undefined, preferredTime: preferredTime.trim() || undefined, address: address.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not send request");
      setOpen(false);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!loggedIn) {
    return (
      <Link href={`/login?next=/providers/${providerId}`} className="btn-primary w-full justify-center">
        <CalendarCheck size={16} /> Log in to request this helper
      </Link>
    );
  }
  if (!canRequest) return null;

  const statusUi: Record<Status, { cls: string; icon: React.ReactNode; label: string }> = {
    PENDING: { cls: "bg-amber-50 text-amber-800 ring-amber-200", icon: <Clock size={15} />, label: "Request sent — waiting for a response" },
    ACCEPTED: { cls: "bg-teal-50 text-teal-800 ring-teal-200", icon: <Check size={15} />, label: "Accepted! You can contact them now" },
    DECLINED: { cls: "bg-red-50 text-red-800 ring-red-200", icon: <X size={15} />, label: "Declined — you can send a new request" },
  };

  return (
    <div>
      {initialRequest && (
        <div className={`mb-2 rounded-lg px-3 py-2 text-sm ring-1 ${statusUi[initialRequest.status].cls}`}>
          <div className="flex items-center gap-2 font-medium">
            {statusUi[initialRequest.status].icon} {statusUi[initialRequest.status].label}
          </div>
          {initialRequest.status === "DECLINED" && initialRequest.responseNote && (
            <p className="mt-1 pl-6">
              <span className="font-semibold">Reason:</span> {initialRequest.responseNote}
            </p>
          )}
        </div>
      )}

      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary w-full justify-center">
          <CalendarCheck size={16} /> {initialRequest ? "Update request" : `Request ${providerName}`}
        </button>
      ) : (
        <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Send a booking request</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Service</label>
              <select value={service} onChange={(e) => setService(e.target.value)} className="input">
                {services.map((s) => (
                  <option key={s} value={s}>
                    {displayService(s, otherService)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Preferred time (optional)</label>
              <input
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="input"
                placeholder="e.g. Mornings, weekdays"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Your address <span className="font-normal text-slate-400">(where the helper should come)</span></label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} maxLength={300} className="input" placeholder="House / flat, area, city, landmark…" />
          </div>
          <div className="mt-3">
            <label className="label">Message (optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={600} className="input" placeholder="Tell them what you need…" />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Sending…" : "Send request"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
