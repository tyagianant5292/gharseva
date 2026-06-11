import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Public provider search. Phone numbers are NEVER returned here (gated on detail).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service")?.trim();
  const city = searchParams.get("city")?.trim();
  const locality = searchParams.get("locality")?.trim();
  const pincode = searchParams.get("pincode")?.trim();
  const q = searchParams.get("q")?.trim();
  const verifiedOnly = searchParams.get("verified") === "1";

  const where: Prisma.ProviderProfileWhereInput = { available: true };
  if (service) where.services = { has: service };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (locality) where.locality = { contains: locality, mode: "insensitive" };
  if (pincode) where.pincode = pincode;
  if (verifiedOnly) where.verified = true;
  if (q) where.user = { is: { name: { contains: q, mode: "insensitive" } } };

  const providers = await prisma.providerProfile.findMany({
    where,
    take: 60,
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      services: true,
      city: true,
      locality: true,
      pincode: true,
      gender: true,
      experienceYears: true,
      expectedSalary: true,
      bio: true,
      photoUrl: true,
      verified: true,
      user: { select: { name: true, emailVerified: true } },
    },
  });

  const result = providers.map((p) => ({
    id: p.id,
    name: p.user.name,
    services: p.services,
    city: p.city,
    locality: p.locality,
    pincode: p.pincode,
    gender: p.gender,
    experienceYears: p.experienceYears,
    expectedSalary: p.expectedSalary,
    bio: p.bio,
    photoUrl: p.photoUrl,
    verified: p.verified,
    emailVerified: p.user.emailVerified,
  }));

  return NextResponse.json({ providers: result, count: result.length });
}
