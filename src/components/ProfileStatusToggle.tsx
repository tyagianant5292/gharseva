"use client";

import { useState } from "react";
import { Power, Eye, EyeOff } from "lucide-react";

export default function ProfileStatusToggle({ initial }: { initial: boolean }) {
  const [available, setAvailable] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !available;
    setBusy(true);
    setAvailable(next); // optimistic
    try {
      const res = await fetch("/api/provider/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next }),
      });
      if (!res.ok) setAvailable(!next); // revert on failure
    } catch {
      setAvailable(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`mt-5 flex flex-wrap items-center gap-3 rounded-xl p-4 ring-1 ${
        available ? "bg-white ring-slate-200" : "bg-slate-100 ring-slate-300"
      }`}
    >
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${available ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"}`}>
        {available ? <Eye size={18} /> : <EyeOff size={18} />}
      </div>
      <div className="mr-auto">
        <p className="text-sm font-semibold text-slate-800">
          {available ? "Profile is active" : "Profile is disabled"}
        </p>
        <p className="text-xs text-slate-500">
          {available
            ? "Families can find you in search."
            : "You're hidden from search. Enable when you need work again."}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        className={`btn ${
          available
            ? "border border-slate-300 bg-white text-slate-700 hover:border-red-300 hover:text-red-600"
            : "bg-teal-600 text-white hover:bg-teal-700"
        }`}
      >
        <Power size={15} /> {busy ? "…" : available ? "Disable profile" : "Enable profile"}
      </button>
    </div>
  );
}
