import Link from "next/link";
import { BadgeCheck, MapPin, Briefcase, Mail } from "lucide-react";
import { serviceLabel, serviceIcon } from "@/lib/services";
import { formatMoney } from "@/lib/money";
import Stars from "./Stars";

export type ProviderListItem = {
  id: string;
  name: string;
  services: string[];
  country?: string | null;
  city: string;
  locality: string;
  pincode: string;
  lat?: number | null;
  lng?: number | null;
  gender?: string | null;
  experienceYears: number;
  expectedSalary?: number | null;
  bio?: string | null;
  photoThumbUrl?: string | null;
  verified: boolean;
  emailVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  distanceKm?: number | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProviderCard({ p }: { p: ProviderListItem }) {
  return (
    <Link href={`/providers/${p.id}`} className="card animate-fade-up block p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {p.photoThumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photoThumbUrl}
            alt={p.name}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-brand-100 text-base font-bold text-brand-700">
            {initials(p.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate font-semibold text-slate-900">{p.name}</h3>
            {p.verified && (
              <span className="badge-verified">
                <BadgeCheck size={13} /> Verified
              </span>
            )}
            {p.emailVerified && (
              <span
                title="Email verified"
                className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-1.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200"
              >
                <Mail size={11} /> Email
              </span>
            )}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-slate-500">
            <MapPin size={13} /> {p.locality}, {p.city}{p.pincode ? ` · ${p.pincode}` : ""}
            {typeof p.distanceKm === "number" && (
              <span className="ml-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                {p.distanceKm < 1 ? `${Math.round(p.distanceKm * 1000)} m` : `${p.distanceKm.toFixed(1)} km`} away
              </span>
            )}
          </p>
          {p.ratingCount > 0 && (
            <div className="mt-1">
              <Stars avg={p.ratingAvg} count={p.ratingCount} size={13} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.services.slice(0, 4).map((s) => (
          <span key={s} className="chip">
            {serviceIcon(s)} {serviceLabel(s)}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-slate-500">
          <Briefcase size={13} /> {p.experienceYears} yr exp
          {p.gender ? ` · ${p.gender}` : ""}
        </span>
        {p.expectedSalary ? (
          <span className="font-semibold text-slate-700">{formatMoney(p.expectedSalary, p.country)}/mo</span>
        ) : null}
      </div>
    </Link>
  );
}
