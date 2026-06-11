import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Provider detail. The phone/email is only revealed to a logged-in user, and the
// reveal is recorded as a ContactView (lead).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const p = await prisma.providerProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, mobile: true, email: true } } },
  });
  if (!p) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const session = await getSessionUser();
  const canSeeContact = Boolean(session);

  if (canSeeContact && session) {
    // Record the lead (idempotent per viewer+provider). Don't fail the request on error.
    prisma.contactView
      .upsert({
        where: { viewerId_providerId: { viewerId: session.id, providerId: p.id } },
        create: { viewerId: session.id, providerId: p.id },
        update: {},
      })
      .catch(() => {});
  }

  return NextResponse.json({
    provider: {
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
      available: p.available,
      // Gated contact:
      contact: canSeeContact ? { mobile: p.user.mobile, email: p.user.email } : null,
    },
    canSeeContact,
  });
}
