import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { newToken, sendVerificationEmail } from "@/lib/email";
import { cleanInstantRates, minRate } from "@/lib/instant";
import { geocodeProvider } from "@/lib/geocode";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Email is optional, but unique when given.
  if (d.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: d.email } });
    if (byEmail)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }
  // Mobile is the primary identity — must be unique.
  const byMobile = await prisma.user.findFirst({ where: { mobile: d.mobile } });
  if (byMobile)
    return NextResponse.json({ error: "An account with this mobile number already exists" }, { status: 409 });

  const passwordHash = await hashPassword(d.password);
  const verifyToken = d.email ? newToken() : null;

  // Per-service daily rates — chosen independently of monthly services.
  const rates = cleanInstantRates(d.instantRates);
  const hasInstant = Boolean(d.instantAvailable) && Object.keys(rates).length > 0;

  // Derive the map pin from the stated area so "near me" search is accurate.
  const geo =
    d.role === "PROVIDER"
      ? await geocodeProvider(d.country ?? "IN", d.pincode ?? "", d.city ?? "", d.locality ?? "")
      : null;

  const user = await prisma.user.create({
    data: {
      name: d.name,
      email: d.email ?? null,
      mobile: d.mobile,
      passwordHash,
      role: d.role,
      emailVerifyToken: verifyToken,
      // Provider: create profile. "Verified" = email + mobile both present (MVP policy).
      provider:
        d.role === "PROVIDER"
          ? {
              create: {
                services: d.services ?? [],
                country: d.country ?? "IN",
                city: d.city ?? "",
                locality: d.locality ?? "",
                pincode: d.pincode ?? "",
                gender: d.gender || null,
                experienceYears: d.experienceYears ?? 0,
                expectedSalary: d.expectedSalary ?? null,
                instantAvailable: hasInstant,
                dailyRate: hasInstant ? minRate(rates) : null,
                instantRates: hasInstant ? rates : Prisma.JsonNull,
                lat: geo?.lat ?? null,
                lng: geo?.lng ?? null,
                bio: d.bio || null,
                // Starts unverified — provider uploads ID, admin approves.
                verified: false,
                verificationStatus: "PENDING",
              },
            }
          : undefined,
    },
  });

  // Fire-and-forget verification email — only if an email was provided.
  if (user.email && verifyToken) {
    sendVerificationEmail(user.email, user.name, verifyToken).catch(() => {});
  }

  await createSession({ id: user.id, email: user.email ?? "", name: user.name, role: user.role });

  return NextResponse.json({ ok: true, role: user.role, hasEmail: Boolean(user.email) });
}
