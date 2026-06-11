import Link from "next/link";
import { BadgeCheck, Search, UserPlus, ShieldCheck, MapPin, PhoneCall } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import { SERVICES } from "@/lib/services";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="container-x py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm ring-1 ring-brand-100">
              <BadgeCheck size={15} /> Verified helpers near you
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Find trusted <span className="text-brand-600">maids, cooks</span> &amp; home help
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Search verified domestic service providers in your area — or register yourself and
              get discovered by families nearby.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <HeroSearch />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
            Popular:
            {SERVICES.slice(0, 5).map((s) => (
              <Link
                key={s.key}
                href={`/providers?service=${s.key}`}
                className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:text-brand-600 hover:ring-brand-200"
              >
                {s.icon} {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-x py-14">
        <h2 className="text-2xl font-bold text-slate-900">Services on GharSeva</h2>
        <p className="mt-1 text-slate-500">Whatever your home needs, find the right helper.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.key}
              href={`/providers?service=${s.key}`}
              className="card flex flex-col items-center gap-2 p-5 text-center transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{s.icon}</span>
              <span className="text-sm font-medium text-slate-700">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="container-x py-14">
          <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: <Search />, title: "Search nearby", text: "Filter helpers by service, city, locality and pincode." },
              { icon: <ShieldCheck />, title: "See verified profiles", text: "Verified badge means email & mobile are confirmed." },
              { icon: <PhoneCall />, title: "Get their contact", text: "Register for free to unlock contact details and reach out directly." },
            ].map((step, i) => (
              <div key={i} className="card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  {step.icon}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for providers */}
      <section className="container-x py-14">
        <div className="overflow-hidden rounded-2xl bg-teal-600 px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Are you a maid, cook or home helper?</h2>
          <p className="mx-auto mt-2 max-w-xl text-teal-50">
            Create your free profile, get a verified badge, and let families near you find and hire you.
          </p>
          <Link
            href="/register?role=PROVIDER"
            className="btn mt-6 bg-white text-teal-700 hover:bg-teal-50"
          >
            <UserPlus size={16} /> Register as a Helper
          </Link>
        </div>
      </section>

      {/* trust footer strip */}
      <section className="container-x pb-14">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><MapPin size={15} /> Local, area-based search</span>
          <span className="flex items-center gap-1.5"><BadgeCheck size={15} /> Verified providers</span>
          <span className="flex items-center gap-1.5"><PhoneCall size={15} /> Direct contact, no middleman</span>
        </div>
      </section>
    </div>
  );
}
