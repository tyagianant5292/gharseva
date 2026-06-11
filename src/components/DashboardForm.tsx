"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Save } from "lucide-react";
import { SERVICES } from "@/lib/services";

type Profile = {
  name: string;
  email: string;
  mobile: string;
  provider: {
    services: string[];
    city: string;
    locality: string;
    pincode: string;
    gender: string | null;
    experienceYears: number;
    expectedSalary: number | null;
    bio: string | null;
    available: boolean;
    verified: boolean;
  } | null;
};

export default function DashboardForm() {
  const [data, setData] = useState<Profile | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      const d: Profile = await res.json();
      setData(d);
      setServices(d.provider?.services || []);
      setAvailable(d.provider?.available ?? true);
    })();
  }, []);

  function toggleService(key: string) {
    setServices((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services,
          mobile: f.get("mobile"),
          city: f.get("city"),
          locality: f.get("locality"),
          pincode: f.get("pincode"),
          gender: f.get("gender") || undefined,
          experienceYears: f.get("experienceYears") || 0,
          expectedSalary: f.get("expectedSalary") || undefined,
          bio: f.get("bio") || undefined,
          available,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not save");
      setMsg({ ok: true, text: "Profile saved." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Error" });
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div className="container-x py-10 text-slate-500">Loading…</div>;
  const p = data.provider;

  return (
    <div className="container-x max-w-2xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My helper profile</h1>
        {p?.verified && (
          <span className="badge-verified">
            <BadgeCheck size={14} /> Verified
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Keep your details up to date so families nearby can find you.
      </p>

      <form onSubmit={save} className="card mt-5 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input className="input bg-slate-50" value={data.name} disabled />
          </div>
          <div>
            <label className="label">Mobile number</label>
            <input name="mobile" defaultValue={data.mobile} required className="input" />
          </div>
        </div>

        <div>
          <label className="label">Services</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleService(s.key)}
                className={`rounded-full px-3 py-1 text-sm font-medium ring-1 transition-colors ${
                  services.includes(s.key)
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white text-slate-600 ring-slate-300 hover:ring-brand-300"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">City</label>
            <input name="city" defaultValue={p?.city} required className="input" />
          </div>
          <div>
            <label className="label">Locality</label>
            <input name="locality" defaultValue={p?.locality} required className="input" />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input name="pincode" defaultValue={p?.pincode} required className="input" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Gender</label>
            <select name="gender" defaultValue={p?.gender || ""} className="input">
              <option value="">Prefer not to say</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="label">Experience (yrs)</label>
            <input name="experienceYears" type="number" min={0} defaultValue={p?.experienceYears ?? 0} className="input" />
          </div>
          <div>
            <label className="label">Expected ₹/month</label>
            <input name="expectedSalary" type="number" min={0} defaultValue={p?.expectedSalary ?? ""} className="input" />
          </div>
        </div>

        <div>
          <label className="label">About</label>
          <textarea name="bio" rows={3} defaultValue={p?.bio || ""} className="input" />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          I&apos;m currently available for work
        </label>

        {msg && <p className={`text-sm ${msg.ok ? "text-teal-600" : "text-red-600"}`}>{msg.text}</p>}

        <button type="submit" disabled={saving} className="btn-primary justify-center">
          <Save size={16} /> {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
