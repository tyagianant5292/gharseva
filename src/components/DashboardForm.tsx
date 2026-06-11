"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Save, Eye, Users, ShieldAlert, Clock } from "lucide-react";
import { SERVICES } from "@/lib/services";
import VerificationSection from "./VerificationSection";
import EmailMethodCard from "./EmailMethodCard";
import ProfileStatusToggle from "./ProfileStatusToggle";
import ProfilePhotoCard from "./ProfilePhotoCard";
import ProviderRequests from "./ProviderRequests";

type Lead = { name: string; at: string };
type Status = "PENDING" | "VERIFIED" | "REJECTED";

type Profile = {
  name: string;
  email: string | null;
  emailVerified: boolean;
  mobile: string;
  views: number;
  recentLeads: Lead[];
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
    verificationStatus: Status;
    verificationNote: string | null;
    idDocType: string | null;
    hasIdDoc: boolean;
    photoUrl: string | null;
  } | null;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function DashboardForm() {
  const [data, setData] = useState<Profile | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      const d: Profile = await res.json();
      setData(d);
      setServices(d.provider?.services || []);
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

      {/* Account-created / verification status banner */}
      {p &&
        (p.verified ? (
          <div className="mt-5 rounded-xl bg-teal-50 p-4 ring-1 ring-teal-200">
            <p className="flex items-center gap-2 font-semibold text-teal-800">
              <BadgeCheck size={18} /> Your account is verified — families can see your Verified badge.
            </p>
          </div>
        ) : p.verificationStatus === "REJECTED" ? (
          <div className="mt-5 rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
            <p className="flex items-center gap-2 font-semibold text-red-800">
              <ShieldAlert size={18} /> Your document verification was not approved.
            </p>
            {p.verificationNote && <p className="mt-0.5 text-sm text-red-700">Reason: {p.verificationNote}</p>}
            <p className="mt-0.5 text-sm text-red-700">Please re-upload a clear ID below.</p>
          </div>
        ) : p.hasIdDoc ? (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="flex items-center gap-2 font-semibold text-amber-800">
              <Clock size={18} /> Documents submitted — verification under review.
            </p>
            <p className="mt-0.5 text-sm text-amber-700">
              An admin will review your ID shortly. You&apos;ll be notified once it&apos;s approved.
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-brand-50 p-4 ring-1 ring-brand-200">
            <p className="text-base font-semibold text-brand-800">
              🎉 Welcome, {data.name}! Your account has been created.
            </p>
            <p className="mt-0.5 text-sm text-brand-700">
              Verify your account to earn the <span className="font-semibold">Verified badge</span> and win
              families&apos; trust — use either method below.
            </p>
          </div>
        ))}

      {/* Profile photo */}
      {p && <ProfilePhotoCard initialPhoto={p.photoUrl} name={data.name} />}

      {/* Profile active / disabled toggle */}
      {p && <ProfileStatusToggle initial={p.available} />}

      {/* Incoming booking requests */}
      {p && <ProviderRequests />}

      {/* Verification — two ways: email and/or documents */}
      {p && (
        <div className="mt-5">
          <h2 className="text-sm font-semibold text-slate-700">
            Get verified <span className="font-normal text-slate-400">— do either or both</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Email confirmation is a light trust signal; the admin document check gives the trusted Verified badge.
          </p>
          <div className="mt-3">
            <EmailMethodCard email={data.email} emailVerified={data.emailVerified} />
          </div>
          <VerificationSection
            initialStatus={p.verificationStatus}
            note={p.verificationNote}
            hasIdDoc={p.hasIdDoc}
          />
        </div>
      )}

      {/* Profile views / leads */}
      <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <Eye size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{data.views}</div>
            <div className="text-sm text-slate-500">profile {data.views === 1 ? "view" : "views"}</div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <Users size={15} /> Recent interest
          </h2>
          {data.recentLeads.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              No one has unlocked your contact yet. Keep your profile complete to get noticed.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {data.recentLeads.map((l, i) => (
                <li key={i} className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{l.name}</span>{" "}
                  <span className="text-slate-400">· {timeAgo(l.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

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

        {msg && <p className={`text-sm ${msg.ok ? "text-teal-600" : "text-red-600"}`}>{msg.text}</p>}

        <button type="submit" disabled={saving} className="btn-primary justify-center">
          <Save size={16} /> {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
