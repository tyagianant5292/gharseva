"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { SERVICES } from "@/lib/services";
import ProviderCard, { type ProviderListItem } from "./ProviderCard";

export default function ProvidersBrowser() {
  const sp = useSearchParams();
  const [service, setService] = useState(sp.get("service") || "");
  const [city, setCity] = useState(sp.get("city") || "");
  const [locality, setLocality] = useState(sp.get("locality") || "");
  const [pincode, setPincode] = useState(sp.get("pincode") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [items, setItems] = useState<ProviderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (city.trim()) params.set("city", city.trim());
    if (locality.trim()) params.set("locality", locality.trim());
    if (pincode.trim()) params.set("pincode", pincode.trim());
    if (verifiedOnly) params.set("verified", "1");
    try {
      const res = await fetch(`/api/providers?${params.toString()}`);
      const data = await res.json();
      setItems(data.providers || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [service, city, locality, pincode, verifiedOnly]);

  // initial load + reload when verifiedOnly toggles
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedOnly]);

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-slate-900">Find home helpers</h1>
      <p className="mt-1 text-slate-500">Search verified maids, cooks &amp; more in your area.</p>

      {/* Filters */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="card mt-5 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_0.8fr_auto]"
      >
        <select value={service} onChange={(e) => setService(e.target.value)} className="input">
          <option value="">Any service</option>
          {SERVICES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.icon} {s.label}
            </option>
          ))}
        </select>
        <input className="input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <input className="input" placeholder="Locality" value={locality} onChange={(e) => setLocality(e.target.value)} />
        <input className="input" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        <button type="submit" className="btn-primary justify-center">
          <Search size={16} /> Search
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
          <SlidersHorizontal size={14} /> Verified only
        </label>
        <span className="text-sm text-slate-500">{loading ? "Searching…" : `${items.length} helper(s) found`}</span>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-slate-600">No helpers match your search yet.</p>
          <p className="mt-1 text-sm text-slate-400">Try a different service or a wider area.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProviderCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
