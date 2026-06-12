import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { asRates } from "@/lib/instant";

// Provider detail. The phone/email is only revealed to a logged-in user, and the
// reveal is recorded as a ContactView (lead).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const p = await prisma.providerProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, mobile: true, email: true, emailVerified: true } } },
  });
  if (!p) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const session = await getSessionUser();
  const canSeeContact = Boolean(session);

  if (canSeeContact && session) {
    // Record the lead (idempotent per viewer+provider). Don't fail the request on error.
    await prisma.contactView
      .upsert({
        where: { viewerId_providerId: { viewerId: session.id, providerId: p.id } },
        create: { viewerId: session.id, providerId: p.id },
        update: {},
      })
      .catch(() => {});
  }

  const reviews = await prisma.review.findMany({
    where: { providerId: p.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { author: { select: { id: true, name: true } } },
  });

  const myReview = session ? reviews.find((r) => r.author.id === session.id) : undefined;

  const myRequest = session
    ? await prisma.bookingRequest.findUnique({
        where: { customerId_providerId: { customerId: session.id, providerId: p.id } },
        select: { status: true, service: true, message: true, preferredTime: true, responseNote: true },
      })
    : null;

  return NextResponse.json({
    provider: {
      id: p.id,
      name: p.user.name,
      services: p.services,
      country: p.country,
      city: p.city,
      locality: p.locality,
      pincode: p.pincode,
      gender: p.gender,
      experienceYears: p.experienceYears,
      expectedSalary: p.expectedSalary,
      instantAvailable: p.instantAvailable,
      dailyRate: p.dailyRate,
      instantRates: asRates(p.instantRates),
      otherService: p.otherService,
      otherServiceDesc: p.otherServiceDesc,
      bio: p.bio,
      photoUrl: p.photoUrl,
      verificationStatus: p.verificationStatus,
      verified: p.verified,
      emailVerified: p.user.emailVerified,
      available: p.available,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      // Gated contact:
      contact: canSeeContact ? { mobile: p.user.mobile, email: p.user.email } : null,
    },
    canSeeContact,
    // The viewer can review/request once logged in and it's not their own profile.
    canReview: Boolean(session) && session?.id !== p.userId,
    myRequest,
    myReview: myReview ? { rating: myReview.rating, comment: myReview.comment } : null,
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.author.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
  });
}
