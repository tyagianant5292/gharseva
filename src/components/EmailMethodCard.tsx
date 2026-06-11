"use client";

import { useState } from "react";
import { BadgeCheck, Mail } from "lucide-react";

export default function EmailMethodCard({
  email,
  emailVerified,
}: {
  email: string | null;
  emailVerified: boolean;
}) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const d = await res.json();
      setMsg(d.sent ? "Sent! Check your inbox." : "Couldn't send right now.");
    } catch {
      setMsg("Couldn't send right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-800">Email verification</h3>
        {emailVerified && (
          <span className="badge-verified ml-auto">
            <BadgeCheck size={13} /> Verified
          </span>
        )}
      </div>

      {!email ? (
        <p className="mt-2 text-sm text-slate-500">
          No email on your account. You can verify with documents instead — or add an email later from your profile.
        </p>
      ) : emailVerified ? (
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{email}</span> is confirmed.
        </p>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-slate-500">
            We sent a link to <span className="font-medium text-slate-700">{email}</span>. Click it to confirm.
          </p>
          <button onClick={resend} disabled={busy} className="btn-outline mt-2 py-1.5 text-xs">
            {busy ? "Sending…" : "Resend email"}
          </button>
          {msg && <span className="ml-2 text-xs text-slate-500">{msg}</span>}
        </div>
      )}
    </div>
  );
}
