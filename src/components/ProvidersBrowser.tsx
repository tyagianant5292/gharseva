"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, LocateFixed, X, List, Map as MapIcon } from "lucide-react";
import { SERVICES } from "@/lib/services";
import ProviderCard, { type ProviderListItem } from "./ProviderCard";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="mt-6 h-[480px] animate-pulse rounded-xl bg-slate-100" />,
});

export default function ProvidersBrowser() {
  const sp = useSearchParams();
  const [service, setService] = useState(sp.get("service") || "");
  const [city, setCity] = useState(sp.get("city") || "");
  const [locality, setLocality] = useState(sp.get("locality") || "");
  const [pincode, setPincode] = useState(sp.get("pincode") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMe, setNearMe] = useState(false);
  const [radius, setRadius] = useState(5);
  const [geoError, setGeoError] = useState("");
  const [locating, setLocating] = useState(false);

  const [items, setItems] = useState<ProviderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (verifiedOnly) params.set("verified", "1");
    if (nearMe && coords) {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
      params.set("radius", String(radius));
    } else {
      if (city.trim()) params.set("city", city.trim());
      if (locality.trim()) params.set("locality", locality.trim());
      if (pincode.trim()) params.set("pincode", pincode.trim());
    }
    try {
      const res = await fetch(`/api/providers?${params.toString()}`);
      const data = await res.json();
      setItems(data.providers || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [service, city, locality, pincode, verifiedOnly, nearMe, coords, radius]);

  // reload on mount + when near-me / coords / verified change (slider release calls load directly)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedOnly, nearMe, coords]);

  function searchNearMe() {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support location.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMe(true);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setGeoError("Couldn't get your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-slate-900">Find home helpers</h1>
      <p className="mt-1 text-slate-500">Search verified maids, cooks &amp; more in your area.</p>

      {/* Filters */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setNearMe(false);
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
        <input className="input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} disabled={nearMe} />
        <input className="input" placeholder="Locality" value={locality} onChange={(e) => setLocality(e.target.value)} disabled={nearMe} />
        <input className="input" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} disabled={nearMe} />
        <button type="submit" className="btn-primary justify-center">
          <Search size={16} /> Search
        </button>
      </form>

      {/* Near me */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!nearMe ? (
          <button onClick={searchNearMe} disabled={locating} className="btn-outline">
            <LocateFixed size={15} /> {locating ? "Locating…" : "Search near me"}
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 px-4 py-2.5 ring-1 ring-brand-100">
            <span className="text-sm font-medium text-brand-800">Within {radius} km of you</span>
            <input
              type="range"
              min={1}
              max={25}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              onPointerUp={() => load()}
              onTouchEnd={() => load()}
              className="w-40 accent-brand-600"
            />
            <button onClick={() => { setNearMe(false); setGeoError(""); }} className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
              <X size={14} /> Clear
            </button>
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
          <SlidersHorizontal size={14} /> Verified only
        </label>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-slate-500">{loading ? "Searching…" : `${items.length} found`}</span>
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button onClick={() => setView("list")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium ${view === "list" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}>
              <List size={14} /> List
            </button>
            <button onClick={() => setView("map")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium ${view === "map" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}>
              <MapIcon size={14} /> Map
            </button>
          </div>
        </div>
      </div>
      {geoError && <p className="mt-2 text-sm text-red-600">{geoError}</p>}

      {/* Results */}
      {view === "map" ? (
        <div className="mt-6">
          <MapView items={items} center={nearMe ? coords : null} />
        </div>
      ) : loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-slate-600">No helpers match your search yet.</p>
          <p className="mt-1 text-sm text-slate-400">
            {nearMe ? "Try a larger radius — few helpers have pinned their location yet." : "Try a different service or a wider area."}
          </p>
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
