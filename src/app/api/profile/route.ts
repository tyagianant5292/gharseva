import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";
import { cleanInstantRates, minRate, asRates } from "@/lib/instant";
import { geocodeProvider } from "@/lib/geocode";

// Returns the current provider's profile (for the dashboard).
export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { provider: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Profile-view stats (leads = logged-in people who unlocked this provider's contact).
  let views = 0;
  let recentLeads: { name: string; at: string }[] = [];
  if (user.provider) {
    views = await prisma.contactView.count({ where: { providerId: user.provider.id } });
    const leads = await prisma.contactView.findMany({
      where: { providerId: user.provider.id },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { viewer: { select: { name: true } } },
    });
    recentLeads = leads.map((l) => ({ name: l.viewer.name, at: l.createdAt.toISOString() }));
  }

  const p = user.provider;
  return NextResponse.json({
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    mobile: user.mobile,
    role: user.role,
    provider: p
      ? {
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
          otherService: p.otherService,
          otherServiceDesc: p.otherServiceDesc,
          bio: p.bio,
          available: p.available,
          verified: p.verified,
          verificationStatus: p.verificationStatus,
          verificationNote: p.verificationNote,
          idDocType: p.idDocType,
          hasIdDoc: Boolean(p.idDocUrl),
          photoUrl: p.photoUrl,
        }
      : null,
    views,
    recentLeads,
  });
}

// Updates the current provider's profile.
export async function PUT(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const existing = await prisma.providerProfile.findUnique({ where: { userId: session.id } });
  if (!existing)
    return NextResponse.json({ error: "Only providers have a profile" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const rates = cleanInstantRates(d.instantRates);
  const hasInstant = Boolean(d.instantAvailable) && Object.keys(rates).length > 0;
  const offersOther = Boolean(d.services?.includes("OTHER")) || "OTHER" in rates;

  // A provider must offer at least one service — monthly or daily.
  if ((d.services?.length ?? 0) === 0 && !hasInstant)
    return NextResponse.json({ error: "Select at least one service" }, { status: 400 });
  if (offersOther && !d.otherService)
    return NextResponse.json({ error: "Please name your other service" }, { status: 400 });

  // Re-derive the map pin from the stated area when the location changes (or is
  // missing) so "near me" stays accurate even if a stale GPS pin was set elsewhere.
  const locationChanged =
    existing.country !== (d.country ?? "IN") ||
    existing.city !== d.city ||
    existing.locality !== d.locality ||
    existing.pincode !== (d.pincode ?? "");
  const geo =
    locationChanged || existing.lat == null
      ? await geocodeProvider(d.country ?? "IN", d.pincode ?? "", d.city, d.locality)
      : null;

  // Keep the user's mobile in sync (contact number).
  await prisma.user.update({ where: { id: session.id }, data: { mobile: d.mobile } });

  const profile = await prisma.providerProfile.update({
    where: { userId: session.id },
    data: {
      services: d.services,
      country: d.country ?? "IN",
      city: d.city,
      locality: d.locality,
      pincode: d.pincode ?? "",
      gender: d.gender || null,
      experienceYears: d.experienceYears,
      expectedSalary: d.expectedSalary ?? null,
      instantAvailable: hasInstant,
      dailyRate: hasInstant ? minRate(rates) : null,
      instantRates: hasInstant ? rates : Prisma.JsonNull,
      ...(geo ? { lat: geo.lat, lng: geo.lng } : {}),
      otherService: offersOther ? d.otherService || null : null,
      otherServiceDesc: offersOther ? d.otherServiceDesc || null : null,
      bio: d.bio || null,
      // 'available' is controlled by the dedicated toggle, not this form.
      // Verification is controlled by admin approval.
    },
  });

  return NextResponse.json({ ok: true, profile });
}
