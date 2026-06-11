"use client";

import { useEffect, useState } from "react";
import { MailWarning, X } from "lucide-react";

export default function EmailVerifyBanner() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const d = await res.json();
        // Only nudge users who actually have an email on file.
        if (d.user && d.user.email && !d.user.emailVerified) {
          setEmail(d.user.email);
          setShow(true);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function resend() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const d = await res.json();
      if (d.alreadyVerified) {
        setShow(false);
        return;
      }
      setMsg(d.sent ? "Verification email sent — check your inbox." : "Email isn't configured yet; ask the admin to enable it.");
    } catch {
      setMsg("Could not resend right now.");
    } finally {
      setBusy(false);
    }
  }

  if (!show) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="container-x flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm text-amber-800">
        <MailWarning size={16} />
        <span>
          Please verify your email <span className="font-medium">{email}</span> to secure your account.
        </span>
        <button onClick={resend} disabled={busy} className="font-semibold underline disabled:opacity-60">
          {busy ? "Sending…" : "Resend email"}
        </button>
        {msg && <span className="text-amber-700">· {msg}</span>}
        <button onClick={() => setShow(false)} className="ml-auto text-amber-500 hover:text-amber-700" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
