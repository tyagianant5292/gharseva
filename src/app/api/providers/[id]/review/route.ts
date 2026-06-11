import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const schema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(600).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Please log in to review" }, { status: 401 });

  const { id: providerId } = await params;

  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    select: { id: true, userId: true },
  });
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  if (provider.userId === session.id)
    return NextResponse.json({ error: "You can't review your own profile" }, { status: 400 });

  // Only people who actually contacted this helper can review them.
  const contacted = await prisma.contactView.findUnique({
    where: { viewerId_providerId: { viewerId: session.id, providerId } },
  });
  if (!contacted)
    return NextResponse.json(
      { error: "You can review after you view this helper's contact." },
      { status: 403 },
    );

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });

  await prisma.review.upsert({
    where: { authorId_providerId: { authorId: session.id, providerId } },
    create: { providerId, authorId: session.id, rating: parsed.data.rating, comment: parsed.data.comment || null },
    update: { rating: parsed.data.rating, comment: parsed.data.comment || null },
  });

  // Recompute the provider's denormalized rating summary.
  const agg = await prisma.review.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.providerProfile.update({
    where: { id: providerId },
    data: { ratingCount: agg._count, ratingAvg: agg._avg.rating ?? 0 },
  });

  return NextResponse.json({ ok: true, ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count });
}
