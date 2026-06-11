"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SERVICES } from "@/lib/services";

export default function HeroSearch() {
  const router = useRouter();
  const [service, setService] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (city.trim()) params.set("city", city.trim());
    if (pincode.trim()) params.set("pincode", pincode.trim());
    router.push(`/providers?${params.toString()}`);
  }

  return (
    <form
      onSubmit={search}
      className="grid gap-3 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-slate-200 sm:grid-cols-[1.2fr_1fr_0.8fr_auto]"
    >
      <select value={service} onChange={(e) => setService(e.target.value)} className="input">
        <option value="">Any service</option>
        {SERVICES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.icon} {s.label}
          </option>
        ))}
      </select>
      <input
        className="input"
        placeholder="City (e.g. Noida)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input
        className="input"
        placeholder="Pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
      />
      <button type="submit" className="btn-primary justify-center">
        <Search size={16} /> Search
      </button>
    </form>
  );
}
