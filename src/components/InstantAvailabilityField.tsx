"use client";

import { Zap } from "lucide-react";
import { SERVICES } from "@/lib/services";

// Independent per-service daily-rate editor. Lists ALL services — the provider
// picks which ones they offer BY THE DAY (separate from their monthly services)
// and sets a rate for each. Controlled via `rates` + `onChange`.
export default function InstantAvailabilityField({
  rates,
  onChange,
  currency = "₹",
}: {
  rates: Record<string, number>;
  onChange: (rates: Record<string, number>) => void;
  currency?: string;
}) {
  function toggle(svc: string, on: boolean) {
    const next = { ...rates };
    if (on) next[svc] = next[svc] ?? 0;
    else delete next[svc];
    onChange(next);
  }
  function setRate(svc: string, n: number) {
    onChange({ ...rates, [svc]: n });
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
        <Zap size={15} className="fill-amber-500 text-amber-500" /> Daily / short-term services &amp; rates
      </p>
      <p className="mt-0.5 text-xs text-amber-800">
        Tick the services you offer <b>by the day</b> (these are separate from your monthly services) and set a per-day rate for each.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const on = rates[s.key] != null;
          return (
            <div
              key={s.key}
              className={`rounded-lg p-2.5 ring-1 ${on ? "bg-white ring-amber-200" : "bg-white/50 ring-amber-100"}`}
            >
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => toggle(s.key, e.target.checked)}
                  className="h-4 w-4 flex-shrink-0 accent-amber-600"
                />
                <span>{s.icon} {s.label}</span>
              </label>
              {on && (
                <div className="mt-2 flex items-center gap-1 pl-6">
                  <span className="text-xs text-slate-400">{currency}</span>
                  <input
                    type="number"
                    min={1}
                    value={rates[s.key] || ""}
                    onChange={(e) => setRate(s.key, Number(e.target.value) || 0)}
                    placeholder="rate"
                    className="input w-24 py-1.5"
                  />
                  <span className="text-xs text-slate-400">/day</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
