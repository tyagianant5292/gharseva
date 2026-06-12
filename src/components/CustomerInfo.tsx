"use client";

import { MapPin, BadgeCheck, ShieldAlert, CalendarClock } from "lucide-react";

// Shows the service address + a few trust signals so the helper knows where to go
// and whether the customer looks genuine.
export default function CustomerInfo({
  address,
  emailVerified,
  since,
  bookings,
}: {
  address?: string | null;
  emailVerified?: boolean;
  since?: string;
  bookings?: number;
}) {
  const monthYear = since ? new Date(since).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : null;

  return (
    <>
      {address ? (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 ring-1 ring-slate-100">
          <MapPin size={15} className="mt-0.5 flex-shrink-0 text-brand-600" />
          <span><span className="font-semibold">Address:</span> {address}</span>
        </p>
      ) : null}

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {emailVerified ? (
          <span className="inline-flex items-center gap-1 font-medium text-teal-700">
            <BadgeCheck size={13} /> Email verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <ShieldAlert size={12} /> Email not verified
          </span>
        )}
        {monthYear && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock size={12} /> Member since {monthYear}
          </span>
        )}
        {typeof bookings === "number" && bookings > 0 && (
          <span>{bookings} booking{bookings === 1 ? "" : "s"} on GharSeva</span>
        )}
      </div>
    </>
  );
}
