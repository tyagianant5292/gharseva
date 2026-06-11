"use client";

import { useEffect, useRef, useState } from "react";
import { CITIES } from "@/lib/cities";

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "City",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const q = value.trim().toLowerCase();
  const matches = q
    ? CITIES.filter((c) => c.toLowerCase().includes(q))
        .sort((a, b) => (a.toLowerCase().startsWith(q) ? -1 : 1) - (b.toLowerCase().startsWith(q) ? -1 : 1))
        .slice(0, 8)
    : [];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {matches.map((c) => (
            <li key={c}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
