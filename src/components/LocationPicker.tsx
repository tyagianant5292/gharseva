"use client";

import { useState } from "react";
import { MapPin, LocateFixed, Check } from "lucide-react";

export default function LocationPicker({
  initialLat,
  initialLng,
}: {
  initialLat: number | null;
  initialLng: number | null;
}) {
  const [hasLoc, setHasLoc] = useState(initialLat != null && initialLng != null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function setLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location.");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/provider/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          if (!res.ok) throw new Error("Could not save location");
          setHasLoc(true);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error");
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setBusy(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow it to be found by nearby families."
            : "Couldn't get your location.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${hasLoc ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
        <MapPin size={20} />
      </div>
      <div className="mr-auto">
        <p className="text-sm font-semibold text-slate-800">Your location {hasLoc && <span className="text-teal-600">✓ pinned</span>}</p>
        <p className="text-xs text-slate-500">
          {hasLoc
            ? "You'll appear in nearby (radius) searches. Update if you move."
            : "Pin your location so families nearby can find you with “near me” search."}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button onClick={setLocation} disabled={busy} className={hasLoc ? "btn-outline" : "btn-primary"}>
        {hasLoc ? <Check size={15} /> : <LocateFixed size={15} />}
        {busy ? "Locating…" : hasLoc ? "Update location" : "Use my location"}
      </button>
    </div>
  );
}
