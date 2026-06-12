"use client";

import { useState } from "react";
import CityAutocomplete from "./CityAutocomplete";
import { lookupPincode } from "@/lib/pincode";

export type LocationValue = { city: string; locality: string; pincode: string };

// India: pincode → auto-fills city + offers area suggestions.
// UAE: no postal codes — just City + Area, with UAE-specific city suggestions.
export default function LocationFields({
  value,
  onChange,
  country = "IN",
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  country?: string | null;
}) {
  const [areas, setAreas] = useState<string[]>([]);
  const [looking, setLooking] = useState(false);
  const isUAE = country === "AE";

  async function onPincode(pincode: string) {
    onChange({ ...value, pincode });
    if (/^[0-9]{6}$/.test(pincode)) {
      setLooking(true);
      const info = await lookupPincode(pincode);
      setLooking(false);
      if (info) {
        setAreas(info.areas);
        onChange({ city: info.city, pincode, locality: value.locality });
      }
    }
  }

  if (isUAE) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Emirate / City</label>
          <CityAutocomplete
            value={value.city}
            country="AE"
            placeholder="Abu Dhabi"
            onChange={(city) => onChange({ ...value, city })}
          />
        </div>
        <div>
          <label className="label">Community / Area</label>
          <input
            className="input"
            placeholder="Khalifa City"
            value={value.locality}
            onChange={(e) => onChange({ ...value, locality: e.target.value, pincode: "" })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="label">
          Pincode {looking && <span className="text-xs font-normal text-slate-400">looking up…</span>}
        </label>
        <input
          className="input"
          inputMode="numeric"
          placeholder="201301"
          value={value.pincode}
          onChange={(e) => onPincode(e.target.value)}
        />
      </div>
      <div>
        <label className="label">City</label>
        <CityAutocomplete value={value.city} onChange={(city) => onChange({ ...value, city })} />
      </div>
      <div>
        <label className="label">Locality / Area</label>
        <input
          className="input"
          list="gs-area-options"
          placeholder={areas.length ? "Pick or type area" : "Sector 62"}
          value={value.locality}
          onChange={(e) => onChange({ ...value, locality: e.target.value })}
        />
        <datalist id="gs-area-options">
          {areas.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
