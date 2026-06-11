import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

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
    mobile: user.mobile,
    role: user.role,
    provider: p
      ? {
          services: p.services,
          city: p.city,
          locality: p.locality,
          pincode: p.pincode,
          gender: p.gender,
          experienceYears: p.experienceYears,
          expectedSalary: p.expectedSalary,
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

  // Keep the user's mobile in sync (contact number).
  await prisma.user.update({ where: { id: session.id }, data: { mobile: d.mobile } });

  const profile = await prisma.providerProfile.update({
    where: { userId: session.id },
    data: {
      services: d.services,
      city: d.city,
      locality: d.locality,
      pincode: d.pincode,
      gender: d.gender || null,
      experienceYears: d.experienceYears,
      expectedSalary: d.expectedSalary ?? null,
      bio: d.bio || null,
      available: d.available ?? true,
      // Verification is NOT changed here — it's controlled by admin approval.
    },
  });

  return NextResponse.json({ ok: true, profile });
}
