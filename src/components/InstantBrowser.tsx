"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Zap, MapPin, BadgeCheck, CalendarDays, Clock } from "lucide-react";
import { SERVICES, displayService, serviceIcon } from "@/lib/services";
import { formatMoney } from "@/lib/money";
import { formatDays } from "@/lib/availability";
import CityAutocomplete from "./CityAutocomplete";
import Stars from "./Stars";

type Item = {
  id: string;
  name: string;
  services: string[];
  otherService?: string | null;
  otherServiceDesc?: string | null;
  availableDays?: string[] | null;
  availableTime?: string | null;
  country?: string | null;
  city: string;
  locality: string;
  pincode: string;
  photoThumbUrl?: string | null;
  verified: boolean;
  dailyRate?: number | null;
  instantRates?: Record<string, number> | null;
  ratingAvg: number;
  ratingCount: number;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  const ms = new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

export default function InstantBrowser() {
  const [service, setService] = useState("");
  const [city, setCity] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ instant: "1" });
    if (service) params.set("service", service);
    if (city.trim()) params.set("city", city.trim());
    try {
      const res = await fetch(`/api/providers?${params.toString()}`);
      const d = await res.json();
      setItems(d.providers || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [service, city]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-x py-8">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
          <Zap size={20} className="fill-amber-500 text-amber-500" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instant Service</h1>
          <p className="text-sm text-slate-500">Hire a helper by the day — pick your dates and book.</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">
        💵 No online payment for now — you pay the helper directly (cash) when they arrive.
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); load(); }}
        className="card mt-5 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]"
      >
        <select value={service} onChange={(e) => setService(e.target.value)} className="input">
          <option value="">Any service</option>
          {SERVICES.map((s) => (
            <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
          ))}
        </select>
        <CityAutocomplete value={city} onChange={setCity} />
        <button type="submit" className="btn-primary justify-center">
          <Search size={16} /> Search
        </button>
      </form>

      <p className="mt-3 text-sm text-slate-500">{loading ? "Searching…" : `${items.length} helper${items.length === 1 ? "" : "s"} available by the day`}</p>

      {loading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-44 animate-pulse bg-slate-100" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-4 p-10 text-center">
          <p className="text-slate-600">No helpers offer daily booking here yet.</p>
          <p className="mt-1 text-sm text-slate-400">Try a different service or city.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <InstantCard key={p.id} p={p} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function InstantCard({ p, open, onToggle }: { p: Item; open: boolean; onToggle: () => void }) {
  const rates = p.instantRates || {};
  const instantServices = Object.keys(rates);
  const fromRate = instantServices.length ? Math.min(...Object.values(rates)) : p.dailyRate ?? null;
  const [svc, setSvc] = useState(instantServices[0] || "");
  const [start, setStart] = useState(todayStr());
  const [end, setEnd] = useState(todayStr());
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const rate = rates[svc] ?? 0;
  const validRange = start && end && new Date(end) >= new Date(start);
  const days = validRange ? daysBetween(start, end) : 0;
  const total = rate * days;

  async function book(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/instant/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: p.id, service: svc, startDate: start, endDate: end, address: address.trim() || undefined, message: message.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not book");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const initials = p.name.split(" ").map((x) => x[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start gap-3">
        {p.photoThumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoThumbUrl} alt={p.name} className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
        ) : (
          <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-amber-100 text-base font-bold text-amber-700">{initials}</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/providers/${p.id}`} className="truncate font-semibold text-slate-900 hover:text-brand-600">{p.name}</Link>
            {p.verified && <span className="badge-verified"><BadgeCheck size={13} /> Verified</span>}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={13} /> {p.locality}, {p.city}
          </p>
          {p.ratingCount > 0 && <div className="mt-1"><Stars avg={p.ratingAvg} count={p.ratingCount} size={13} /></div>}
        </div>
        {fromRate != null && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">from</div>
            <div className="font-bold text-slate-900">{formatMoney(fromRate, p.country)}</div>
            <div className="text-xs text-slate-400">/ day</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {instantServices.slice(0, 5).map((s) => (
          <span key={s} className="chip">{serviceIcon(s)} {displayService(s, p.otherService)}</span>
        ))}
      </div>

      {instantServices.includes("OTHER") && p.otherServiceDesc && (
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium text-slate-700">✨ {p.otherService}:</span> {p.otherServiceDesc}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} className="text-sky-600" /> {formatDays(p.availableDays)}
        </span>
        {p.availableTime && (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="text-sky-600" /> {p.availableTime}
          </span>
        )}
      </div>

      {done ? (
        <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-800 ring-1 ring-teal-200">
          ✅ Booking request sent! The helper will accept or decline shortly — track it in{" "}
          <Link href="/requests" className="font-semibold underline">My Requests</Link>.
        </div>
      ) : !open ? (
        <button onClick={onToggle} className="btn-primary mt-3 justify-center">
          <CalendarDays size={16} /> Book by the day
        </button>
      ) : (
        <form onSubmit={book} className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <label className="label">Service</label>
            <select value={svc} onChange={(e) => setSvc(e.target.value)} className="input">
              {instantServices.map((s) => (
                <option key={s} value={s}>{displayService(s, p.otherService)} — {formatMoney(rates[s], p.country)}/day</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">From</label>
              <input type="date" min={todayStr()} value={start} onChange={(e) => { setStart(e.target.value); if (new Date(e.target.value) > new Date(end)) setEnd(e.target.value); }} className="input" />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
            </div>
          </div>
          {(p.availableDays?.length || p.availableTime) && (
            <p className="-mt-1 text-xs text-sky-700">
              📅 Usually free: {formatDays(p.availableDays)}{p.availableTime ? ` · ${p.availableTime}` : ""}
            </p>
          )}
          <div>
            <label className="label">Your address <span className="font-normal text-slate-400">(where to come)</span></label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} maxLength={300} className="input" placeholder="House / flat, area, city, landmark…" />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={600} className="input" placeholder="What you need, timings…" />
          </div>

          {validRange && rate > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm ring-1 ring-amber-100">
              <span className="text-amber-800">{days} {days === 1 ? "day" : "days"} × {formatMoney(rate, p.country)}</span>
              <span className="font-bold text-amber-900">{formatMoney(total, p.country)}</span>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy || !validRange || rate <= 0 || !address.trim()} className="btn-primary justify-center disabled:opacity-50">
              {busy ? "Sending…" : "Send booking request"}
            </button>
            <button type="button" onClick={onToggle} className="btn-outline">Cancel</button>
          </div>
          <p className="text-xs text-slate-400">Payment is settled directly with the helper (cash on arrival).</p>
        </form>
      )}
    </div>
  );
}
