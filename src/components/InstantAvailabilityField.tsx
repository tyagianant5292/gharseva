"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

// Lets a provider opt into daily / short-term ("instant") bookings and set a per-day rate.
// Emits hidden inputs `instantAvailable` ("true"/"false") and `dailyRate` for FormData forms.
export default function InstantAvailabilityField({
  defaultChecked = false,
  defaultRate,
  currency = "₹",
}: {
  defaultChecked?: boolean;
  defaultRate?: number | null;
  currency?: string;
}) {
  const [on, setOn] = useState(defaultChecked);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
        <span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-900">
            <Zap size={15} className="fill-amber-500 text-amber-500" /> Available for daily / short-term bookings
          </span>
          <span className="mt-0.5 block text-xs text-amber-800">
            Families can book you by the day (e.g. a cook for 2 days) and you&apos;ll be listed under <b>Instant Service</b>.
          </span>
        </span>
      </label>

      <input type="hidden" name="instantAvailable" value={on ? "true" : "false"} />

      {on && (
        <div className="mt-3">
          <label className="label text-amber-900">Per-day rate ({currency})</label>
          <input
            name="dailyRate"
            type="number"
            min={0}
            defaultValue={defaultRate ?? ""}
            required
            className="input max-w-[220px]"
            placeholder={currency === "AED" ? "e.g. 120" : "e.g. 500"}
          />
        </div>
      )}
    </div>
  );
}
