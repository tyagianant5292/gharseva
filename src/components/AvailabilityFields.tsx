"use client";

import { CalendarDays, Clock } from "lucide-react";
import { WEEKDAYS } from "@/lib/availability";

const TIME_PRESETS = ["Mornings", "Afternoons", "Evenings", "Flexible"];

// Lets a short-term helper say which weekdays + time they're free for instant jobs.
export default function AvailabilityFields({
  days,
  setDays,
  time,
  setTime,
  currency,
}: {
  days: string[];
  setDays: (d: string[]) => void;
  time: string;
  setTime: (t: string) => void;
  currency?: string; // unused, kept for call-site symmetry
}) {
  function toggleDay(key: string) {
    setDays(days.includes(key) ? days.filter((d) => d !== key) : [...days, key]);
  }

  return (
    <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-sky-900">
        <CalendarDays size={15} /> When are you available for short jobs?
      </p>

      <div>
        <label className="mb-1 block text-xs font-medium text-sky-800">Days (leave all unticked for any day)</label>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((w) => (
            <button
              key={w.key}
              type="button"
              onClick={() => toggleDay(w.key)}
              className={`rounded-full px-3 py-1 text-sm font-medium ring-1 transition-colors ${
                days.includes(w.key)
                  ? "bg-sky-600 text-white ring-sky-600"
                  : "bg-white text-slate-600 ring-slate-300 hover:ring-sky-300"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-sky-800">
          <Clock size={12} /> Time you&apos;re free (optional)
        </label>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          maxLength={60}
          list="gs-time-presets"
          className="input"
          placeholder="e.g. Evenings after 6 PM"
        />
        <datalist id="gs-time-presets">
          {TIME_PRESETS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
