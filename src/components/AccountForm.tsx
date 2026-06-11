"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, BadgeCheck, Save } from "lucide-react";

type Account = { name: string; email: string | null; mobile: string; role: string; emailVerified: boolean };

export default function AccountForm() {
  const router = useRouter();
  const [acc, setAcc] = useState<Account | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account");
      const d = await res.json();
      setAcc(d.user);
    })();
  }, []);

  async function saveInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.get("name"), mobile: f.get("mobile"), email: f.get("email") }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save");
      setInfoMsg({ ok: true, text: d.emailChanged ? "Saved. Check your inbox to verify the new email." : "Saved." });
      router.refresh(); // update navbar name
    } catch (err) {
      setInfoMsg({ ok: false, text: err instanceof Error ? err.message : "Error" });
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg(null);
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: f.get("currentPassword"), newPassword: f.get("newPassword") }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not change password");
      setPwMsg({ ok: true, text: "Password updated." });
      form.reset();
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Error" });
    } finally {
      setSavingPw(false);
    }
  }

  if (!acc) return <div className="container-x py-10 text-slate-500">Loading…</div>;

  return (
    <div className="container-x max-w-xl py-8">
      <h1 className="text-2xl font-bold text-slate-900">My account</h1>
      <p className="mt-1 text-slate-500">Update your contact details and password.</p>

      {/* Details */}
      <form onSubmit={saveInfo} className="card mt-5 space-y-4 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <User size={16} /> Profile details
        </h2>
        <div>
          <label className="label">Full name</label>
          <input name="name" defaultValue={acc.name} required className="input" />
        </div>
        <div>
          <label className="label">Mobile number</label>
          <input name="mobile" defaultValue={acc.mobile} required className="input" />
        </div>
        <div>
          <label className="label">
            Email <span className="font-normal text-slate-400">(optional)</span>
            {acc.email && acc.emailVerified && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                <BadgeCheck size={12} /> verified
              </span>
            )}
            {acc.email && !acc.emailVerified && <span className="ml-2 text-xs text-amber-600">unverified</span>}
          </label>
          <input name="email" type="email" defaultValue={acc.email || ""} className="input" placeholder="you@example.com" />
        </div>
        {infoMsg && <p className={`text-sm ${infoMsg.ok ? "text-teal-600" : "text-red-600"}`}>{infoMsg.text}</p>}
        <button type="submit" disabled={savingInfo} className="btn-primary justify-center">
          <Save size={16} /> {savingInfo ? "Saving…" : "Save details"}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePw} className="card mt-5 space-y-4 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Lock size={16} /> Change password
        </h2>
        <div>
          <label className="label">Current password</label>
          <input name="currentPassword" type="password" required className="input" />
        </div>
        <div>
          <label className="label">New password</label>
          <input name="newPassword" type="password" required minLength={6} className="input" placeholder="min 6 characters" />
        </div>
        {pwMsg && <p className={`text-sm ${pwMsg.ok ? "text-teal-600" : "text-red-600"}`}>{pwMsg.text}</p>}
        <button type="submit" disabled={savingPw} className="btn-outline justify-center">
          {savingPw ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
