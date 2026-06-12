"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SERVICES } from "@/lib/services";
import LocationFields, { type LocationValue } from "./LocationFields";
import PhoneInput from "./PhoneInput";
import InstantAvailabilityField from "./InstantAvailabilityField";

type Role = "CUSTOMER" | "PROVIDER";

export default function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "";
  const [role, setRole] = useState<Role>((sp.get("role") as Role) === "PROVIDER" ? "PROVIDER" : "CUSTOMER");
  const [services, setServices] = useState<string[]>([]);
  const [country, setCountry] = useState<"IN" | "AE">("IN");
  const [workMode, setWorkMode] = useState<"monthly" | "daily" | "both">("monthly");
  const [instantRates, setInstantRates] = useState<Record<string, number>>({});
  const [loc, setLoc] = useState<LocationValue>({ city: "", locality: "", pincode: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleService(key: string) {
    setServices((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      role,
      name: f.get("name"),
      email: f.get("email"),
      mobile: f.get("mobile"),
      password: f.get("password"),
    };
    if (role === "PROVIDER") {
      Object.assign(payload, {
        services: workMode === "daily" ? [] : services,
        country,
        city: loc.city,
        locality: loc.locality,
        pincode: loc.pincode,
        gender: f.get("gender") || undefined,
        experienceYears: f.get("experienceYears") || 0,
        expectedSalary: workMode === "daily" ? undefined : f.get("expectedSalary") || undefined,
        instantAvailable: workMode !== "monthly",
        instantRates: workMode !== "monthly" ? instantRates : undefined,
        bio: f.get("bio") || undefined,
      });
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push(next || (role === "PROVIDER" ? "/dashboard" : "/providers"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="container-x max-w-xl py-10">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Free to join. Takes a minute.</p>

        {/* role toggle */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {(["CUSTOMER", "PROVIDER"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                role === r ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              }`}
            >
              {r === "CUSTOMER" ? "I need help" : "I'm a helper"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input name="name" required className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="label">Mobile number</label>
              <PhoneInput
                key={role === "PROVIDER" ? country : "default"}
                required
                defaultCode={role === "PROVIDER" && country === "AE" ? "+971" : "+91"}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Email <span className="font-normal text-slate-400">(optional)</span></label>
              <input name="email" type="email" className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" required minLength={6} className="input" placeholder="min 6 characters" />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-400">
            No email? No problem — you can sign up and log in with just your mobile number.
          </p>

          {role === "PROVIDER" && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <label className="label">Country</label>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-white p-1 ring-1 ring-slate-200">
                  {([["IN", "🇮🇳 India"], ["AE", "🇦🇪 UAE"]] as const).map(([c, lbl]) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCountry(c);
                        setLoc({ city: "", locality: "", pincode: "" });
                      }}
                      className={`rounded-md py-1.5 text-sm font-semibold transition-colors ${
                        country === c ? "bg-brand-600 text-white" : "text-slate-500"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                {country === "AE" && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    In the UAE, verifying your <span className="font-medium">email</span> earns the Verified badge — no ID documents needed.
                  </p>
                )}
              </div>
              <div>
                <label className="label">How do you want to work?</label>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
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
                {workMode === "daily" && (
                  <p className="mt-1.5 text-xs text-slate-500">Great for helpers available only for short / per-day jobs — set your services &amp; rates below.</p>
                )}
              </div>

              {workMode !== "daily" && (
                <div>
                  <label className="label">{workMode === "both" ? "Monthly services you offer" : "Services you offer"}</label>
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

              <LocationFields value={loc} onChange={setLoc} country={country} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Gender</label>
                  <select name="gender" className="input">
                    <option value="">Prefer not to say</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Experience (yrs)</label>
                  <input name="experienceYears" type="number" min={0} defaultValue={0} className="input" />
                </div>
              </div>

              {workMode !== "daily" && (
                <div className="sm:max-w-[220px]">
                  <label className="label">Expected {country === "AE" ? "AED" : "₹"}/month</label>
                  <input name="expectedSalary" type="number" min={0} className="input" placeholder={country === "AE" ? "e.g. 1500" : "e.g. 8000"} />
                </div>
              )}

              {workMode !== "monthly" && (
                <InstantAvailabilityField
                  rates={instantRates}
                  onChange={setInstantRates}
                  currency={country === "AE" ? "AED" : "₹"}
                />
              )}
              <div>
                <label className="label">About you (optional)</label>
                <textarea name="bio" rows={3} className="input" placeholder="Languages, timings, what you specialise in…" />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href={`/login${next ? `?next=${next}` : ""}`} className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
