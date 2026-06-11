"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, MapPin, Briefcase, Phone, Mail, Lock, ArrowLeft } from "lucide-react";
import { serviceLabel, serviceIcon } from "@/lib/services";

type Detail = {
  id: string;
  name: string;
  services: string[];
  city: string;
  locality: string;
  pincode: string;
  gender?: string | null;
  experienceYears: number;
  expectedSalary?: number | null;
  bio?: string | null;
  verified: boolean;
  available: boolean;
  contact: { mobile: string; email: string } | null;
};

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Detail | null>(null);
  const [canSee, setCanSee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/providers/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setP(data.provider);
        setCanSee(data.canSeeContact);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="container-x py-12 text-slate-500">Loading…</div>;
  if (notFound || !p)
    return (
      <div className="container-x py-12">
        <p className="text-slate-600">Provider not found.</p>
        <Link href="/providers" className="mt-3 inline-block text-brand-600 hover:underline">
          ← Back to search
        </Link>
      </div>
    );

  return (
    <div className="container-x max-w-3xl py-8">
      <Link href="/providers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={15} /> Back to search
      </Link>

      <div className="card mt-4 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {p.name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
              {p.verified && (
                <span className="badge-verified">
                  <BadgeCheck size={14} /> Verified
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1 text-slate-500">
              <MapPin size={15} /> {p.locality}, {p.city} · {p.pincode}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <Briefcase size={14} /> {p.experienceYears} years experience
              {p.gender ? ` · ${p.gender}` : ""}
              {p.available ? " · Available" : " · Not available"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-slate-700">Services</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.services.map((s) => (
              <span key={s} className="chip text-sm">
                {serviceIcon(s)} {serviceLabel(s)}
              </span>
            ))}
          </div>
        </div>

        {p.expectedSalary ? (
          <p className="mt-4 text-sm text-slate-600">
            Expected salary: <span className="font-semibold text-slate-900">₹{p.expectedSalary.toLocaleString("en-IN")}/month</span>
          </p>
        ) : null}

        {p.bio ? (
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-slate-700">About</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{p.bio}</p>
          </div>
        ) : null}

        {/* Contact — gated */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold text-slate-700">Contact details</h2>
          {canSee && p.contact ? (
            <div className="mt-3 space-y-2">
              <a href={`tel:${p.contact.mobile}`} className="flex items-center gap-2 text-slate-800 hover:text-brand-600">
                <Phone size={16} className="text-brand-600" /> {p.contact.mobile}
              </a>
              <a href={`mailto:${p.contact.email}`} className="flex items-center gap-2 text-slate-800 hover:text-brand-600">
                <Mail size={16} className="text-brand-600" /> {p.contact.email}
              </a>
            </div>
          ) : (
            <div className="mt-2">
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Lock size={15} /> Contact is hidden. Register or log in (free) to view it.
              </p>
              <div className="mt-3 flex gap-2">
                <Link href={`/login?next=/providers/${p.id}`} className="btn-outline">
                  Login
                </Link>
                <Link href={`/register?next=/providers/${p.id}`} className="btn-primary">
                  Register free
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
