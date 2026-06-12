import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { distanceKm, isValidLatLng } from "@/lib/geo";
import { asRates } from "@/lib/instant";

// Public provider search. Phone numbers are NEVER returned here (gated on detail).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service")?.trim();
  const city = searchParams.get("city")?.trim();
  const locality = searchParams.get("locality")?.trim();
  const pincode = searchParams.get("pincode")?.trim();
  const q = searchParams.get("q")?.trim();
  const verifiedOnly = searchParams.get("verified") === "1";
  const instantOnly = searchParams.get("instant") === "1";

  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const radius = parseFloat(searchParams.get("radius") || "");
  const nearMe = isValidLatLng(lat, lng) && radius > 0;

  const where: Prisma.ProviderProfileWhereInput = { available: true };
  // For instant search we match on per-service daily rates (filtered below), not the
  // monthly `services` list — the two are independent.
  if (service && !instantOnly) where.services = { has: service };
  if (verifiedOnly) where.verified = true;
  if (instantOnly) where.instantAvailable = true;
  if (q) where.user = { is: { name: { contains: q, mode: "insensitive" } } };
  // In "near me" mode we filter by distance, not by text area fields.
  if (nearMe) {
    where.lat = { not: null };
    where.lng = { not: null };
  } else {
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (locality) where.locality = { contains: locality, mode: "insensitive" };
    if (pincode) where.pincode = pincode;
  }

  const providers = await prisma.providerProfile.findMany({
    where,
    take: nearMe ? 300 : 60,
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      services: true,
      country: true,
      city: true,
      locality: true,
      pincode: true,
      lat: true,
      lng: true,
      gender: true,
      experienceYears: true,
      expectedSalary: true,
      instantAvailable: true,
      dailyRate: true,
      instantRates: true,
      bio: true,
      photoThumbUrl: true,
      verified: true,
      ratingAvg: true,
      ratingCount: true,
      user: { select: { name: true, emailVerified: true } },
    },
  });

  let result = providers.map((p) => ({
    id: p.id,
    name: p.user.name,
    services: p.services,
    country: p.country,
    city: p.city,
    locality: p.locality,
    pincode: p.pincode,
    lat: p.lat,
    lng: p.lng,
    gender: p.gender,
    experienceYears: p.experienceYears,
    expectedSalary: p.expectedSalary,
    instantAvailable: p.instantAvailable,
    dailyRate: p.dailyRate,
    instantRates: asRates(p.instantRates),
    bio: p.bio,
    photoThumbUrl: p.photoThumbUrl,
    verified: p.verified,
    emailVerified: p.user.emailVerified,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    distanceKm: null as number | null,
  }));

  // Instant search: keep only providers who offer the requested service by the day.
  if (instantOnly && service) {
    result = result.filter((p) => p.instantRates[service] != null);
  }

  if (nearMe) {
    result = result
      .map((p) => ({
        ...p,
        distanceKm: p.lat != null && p.lng != null ? distanceKm(lat, lng, p.lat, p.lng) : null,
      }))
      .filter((p) => p.distanceKm != null && p.distanceKm <= radius)
      .sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9))
      .slice(0, 60);
  }

  return NextResponse.json({ providers: result, count: result.length, nearMe });
}
