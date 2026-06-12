"use client";

import { Zap } from "lucide-react";
import { serviceLabel, serviceIcon } from "@/lib/services";

// Per-service daily-rate editor. The provider ticks which of their services they
// offer by the day and sets a rate for each. Controlled via `rates` + `onChange`.
export default function InstantAvailabilityField({
  services,
  rates,
  onChange,
  currency = "₹",
}: {
  services: string[];
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
        <Zap size={15} className="fill-amber-500 text-amber-500" /> Daily / short-term rates
      </p>
      <p className="mt-0.5 text-xs text-amber-800">
        Tick the services you offer <b>by the day</b> and set a per-day rate for each. Rates can differ per service.
      </p>

      <div className="mt-3 space-y-2">
        {services.length === 0 ? (
          <p className="text-xs text-amber-800">Select your services above first.</p>
        ) : (
          services.map((svc) => {
            const on = rates[svc] != null;
            return (
              <div key={svc} className="flex items-center gap-3 rounded-lg bg-white p-2 ring-1 ring-amber-100">
                <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => toggle(svc, e.target.checked)}
                    className="h-4 w-4 accent-amber-600"
                  />
                  {serviceIcon(svc)} {serviceLabel(svc)}
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">{currency}</span>
                  <input
                    type="number"
                    min={1}
                    disabled={!on}
                    value={on ? rates[svc] || "" : ""}
                    onChange={(e) => setRate(svc, Number(e.target.value) || 0)}
                    placeholder="rate"
                    className="input w-24 py-1.5 disabled:bg-slate-50 disabled:text-slate-300"
                  />
                  <span className="text-xs text-slate-400">/day</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
