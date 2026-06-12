"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Save, Eye, Users, ShieldAlert, Clock, LayoutGrid, ShieldCheck, Pencil, MapPin, Mail } from "lucide-react";
import { SERVICES } from "@/lib/services";
import VerificationSection from "./VerificationSection";
import EmailMethodCard from "./EmailMethodCard";
import ProfileStatusToggle from "./ProfileStatusToggle";
import ProfilePhotoCard from "./ProfilePhotoCard";
import ProviderRequests from "./ProviderRequests";
import ProviderInstantBookings from "./ProviderInstantBookings";
import LocationPicker from "./LocationPicker";
import LocationFields, { type LocationValue } from "./LocationFields";
import PhoneInput from "./PhoneInput";
import InstantAvailabilityField from "./InstantAvailabilityField";
import OtherServiceFields from "./OtherServiceFields";
import AvailabilityFields from "./AvailabilityFields";

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
    country: string | null;
    city: string;
    locality: string;
    pincode: string;
    gender: string | null;
    experienceYears: number;
    expectedSalary: number | null;
    instantAvailable: boolean;
    dailyRate: number | null;
    instantRates: Record<string, number> | null;
    otherService: string | null;
    otherServiceDesc: string | null;
    availableDays: string[];
    availableTime: string | null;
    bio: string | null;
    available: boolean;
    lat: number | null;
    lng: number | null;
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
  const [country, setCountry] = useState<"IN" | "AE">("IN");
  const [workMode, setWorkMode] = useState<"monthly" | "daily" | "both">("monthly");
  const [instantRates, setInstantRates] = useState<Record<string, number>>({});
  const [otherService, setOtherService] = useState("");
  const [otherServiceDesc, setOtherServiceDesc] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTime, setAvailableTime] = useState("");
  const [loc, setLoc] = useState<LocationValue>({ city: "", locality: "", pincode: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tab, setTab] = useState<"overview" | "verify" | "edit">("overview");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      const d: Profile = await res.json();
      setData(d);
      setServices(d.provider?.services || []);
      if (d.provider) {
        setCountry(d.provider.country === "AE" ? "AE" : "IN");
        setLoc({ city: d.provider.city, locality: d.provider.locality, pincode: d.provider.pincode });
        setInstantRates(d.provider.instantRates || {});
        setOtherService(d.provider.otherService || "");
        setOtherServiceDesc(d.provider.otherServiceDesc || "");
        setAvailableDays(d.provider.availableDays || []);
        setAvailableTime(d.provider.availableTime || "");
        // services now holds MONTHLY services; instant services live in instantRates.
        const hasMonthly = (d.provider.services?.length ?? 0) > 0 || d.provider.expectedSalary != null;
        setWorkMode(
          d.provider.instantAvailable ? (hasMonthly ? "both" : "daily") : "monthly",
        );
      }
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
          services: workMode === "daily" ? [] : services,
          country,
          mobile: f.get("mobile"),
          city: loc.city,
          locality: loc.locality,
          pincode: loc.pincode,
          gender: f.get("gender") || undefined,
          experienceYears: f.get("experienceYears") || 0,
          expectedSalary: workMode === "daily" ? undefined : f.get("expectedSalary") || undefined,
          instantAvailable: workMode !== "monthly",
          instantRates: workMode !== "monthly" ? instantRates : undefined,
          availableDays: workMode !== "monthly" ? availableDays : undefined,
          availableTime: workMode !== "monthly" ? availableTime || undefined : undefined,
          otherService: otherService || undefined,
          otherServiceDesc: otherServiceDesc || undefined,
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
  const initials = data.name.split(" ").map((x) => x[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const nav = [
    { key: "overview" as const, label: "Overview", icon: <LayoutGrid size={16} /> },
    { key: "verify" as const, label: "Verification", icon: <ShieldCheck size={16} /> },
    { key: "edit" as const, label: "Edit profile", icon: <Pencil size={16} /> },
  ];

  const isUAE = country === "AE";

  const statusBanner = p ? (
    p.verified ? (
      <div className="mt-5 rounded-xl bg-teal-50 p-4 ring-1 ring-teal-200">
        <p className="flex items-center gap-2 font-semibold text-teal-800">
          <BadgeCheck size={18} /> Your account is verified — families can see your Verified badge.
        </p>
      </div>
    ) : isUAE ? (
      <div className="mt-5 rounded-xl bg-brand-50 p-4 ring-1 ring-brand-200">
        <p className="text-base font-semibold text-brand-800">🎉 Welcome, {data.name}! Your account has been created.</p>
        <p className="mt-0.5 text-sm text-brand-700">
          {data.emailVerified
            ? "Your email is confirmed."
            : <>Confirm your <span className="font-semibold">email</span> to earn the <span className="font-semibold">Verified badge</span>. </>}
          <button onClick={() => setTab("verify")} className="font-medium underline">
            {data.emailVerified ? "View verification →" : "Verify email →"}
          </button>
        </p>
      </div>
    ) : p.verificationStatus === "REJECTED" ? (
      <div className="mt-5 rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
        <p className="flex items-center gap-2 font-semibold text-red-800">
          <ShieldAlert size={18} /> Your document verification was not approved.
        </p>
        {p.verificationNote && <p className="mt-0.5 text-sm text-red-700">Reason: {p.verificationNote}</p>}
        <button onClick={() => setTab("verify")} className="mt-1 text-sm font-medium text-red-700 underline">
          Re-upload documents →
        </button>
      </div>
    ) : p.hasIdDoc ? (
      <div className="mt-5 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <p className="flex items-center gap-2 font-semibold text-amber-800">
          <Clock size={18} /> Documents submitted — verification under review.
        </p>
        <p className="mt-0.5 text-sm text-amber-700">An admin will review your ID shortly. You&apos;ll be notified once it&apos;s approved.</p>
      </div>
    ) : (
      <div className="mt-5 rounded-xl bg-brand-50 p-4 ring-1 ring-brand-200">
        <p className="text-base font-semibold text-brand-800">🎉 Welcome, {data.name}! Your account has been created.</p>
        <p className="mt-0.5 text-sm text-brand-700">
          Verify your account to earn the <span className="font-semibold">Verified badge</span>.{" "}
          <button onClick={() => setTab("verify")} className="font-medium underline">Get verified →</button>
        </p>
      </div>
    )
  ) : null;

  return (
    <div className="container-x py-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-brand-500 to-brand-600" />
            <div className="-mt-10 px-5 pb-5 text-center">
              {p?.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photoUrl} alt={data.name} className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-white" />
              ) : (
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 ring-4 ring-white">
                  {initials}
                </div>
              )}
              <h2 className="mt-2 font-bold text-slate-900">{data.name}</h2>
              <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
                {p?.verified && (
                  <span className="badge-verified">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
                {data.emailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-1.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
                    <Mail size={11} /> Email
                  </span>
                )}
              </div>
              {p && (
                <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-slate-500">
                  <MapPin size={11} /> {p.locality}, {p.city}
                </p>
              )}
            </div>
          </div>

          <nav className="card p-2">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === n.key ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {n.icon} {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          {tab === "overview" && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">Overview</h1>
              {statusBanner}
              {p && <ProfileStatusToggle initial={p.available} />}

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
                    <p className="mt-2 text-sm text-slate-400">No one has unlocked your contact yet.</p>
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

              {p && <ProviderRequests />}
              {p && <ProviderInstantBookings />}
            </div>
          )}

          {tab === "verify" && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">Get verified</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {isUAE
                  ? "In the UAE, confirming your email earns the Verified badge — we don't collect ID documents."
                  : "Email confirmation is a light trust signal; the admin document check gives the trusted Verified badge."}
              </p>
              <div className="mt-4">
                <EmailMethodCard email={data.email} emailVerified={data.emailVerified} />
              </div>
              {/* Document verification is India-only; the UAE relies on email. */}
              {p && !isUAE && (
                <VerificationSection
                  initialStatus={p.verificationStatus}
                  note={p.verificationNote}
                  hasIdDoc={p.hasIdDoc}
                />
              )}
              {isUAE && !data.email && (
                <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
                  You don&apos;t have an email on your account yet. Add one from{" "}
                  <a href="/account" className="font-medium underline">My Account</a> to get verified.
                </p>
              )}
            </div>
          )}

          {tab === "edit" && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">Edit profile</h1>
              {p && <ProfilePhotoCard initialPhoto={p.photoUrl} name={data.name} />}
              {p && <LocationPicker initialLat={p.lat} initialLng={p.lng} />}

              <form onSubmit={save} className="card mt-5 space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Name</label>
                    <input className="input bg-slate-50" value={data.name} disabled />
                  </div>
                  <div>
                    <label className="label">Mobile number</label>
                    <PhoneInput defaultValue={data.mobile} defaultCode={isUAE ? "+971" : "+91"} required />
                  </div>
                </div>

                {workMode !== "daily" && (
                  <div>
                    <label className="label">{workMode === "both" ? "Monthly services" : "Services"}</label>
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
                )}

                <div>
                  <label className="label">Country</label>
                  <div className="grid max-w-xs grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                    {([["IN", "🇮🇳 India"], ["AE", "🇦🇪 UAE"]] as const).map(([c, lbl]) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCountry(c);
                          setLoc({ city: "", locality: "", pincode: "" });
                        }}
                        className={`rounded-md py-1.5 text-sm font-semibold transition-colors ${
                          country === c ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <LocationFields value={loc} onChange={setLoc} country={country} />

                <div>
                  <label className="label">How do you want to work?</label>
                  <div className="grid max-w-md grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
                    {([["monthly", "Monthly"], ["daily", "Daily / short-term"], ["both", "Both"]] as const).map(([m, lbl]) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setWorkMode(m)}
                        className={`rounded-md py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                          workMode === m ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                {workMode !== "daily" && (
                  <div className="sm:max-w-[220px]">
                    <label className="label">Expected {isUAE ? "AED" : "₹"}/month</label>
                    <input name="expectedSalary" type="number" min={0} defaultValue={p?.expectedSalary ?? ""} className="input" />
                  </div>
                )}

                {workMode !== "monthly" && (
                  <InstantAvailabilityField
                    rates={instantRates}
                    onChange={setInstantRates}
                    currency={isUAE ? "AED" : "₹"}
                  />
                )}

                {workMode !== "monthly" && (
                  <AvailabilityFields days={availableDays} setDays={setAvailableDays} time={availableTime} setTime={setAvailableTime} />
                )}

                {((workMode !== "daily" && services.includes("OTHER")) ||
                  (workMode !== "monthly" && "OTHER" in instantRates)) && (
                  <OtherServiceFields name={otherService} setName={setOtherService} desc={otherServiceDesc} setDesc={setOtherServiceDesc} />
                )}

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
          )}
        </main>
      </div>
    </div>
  );
}
