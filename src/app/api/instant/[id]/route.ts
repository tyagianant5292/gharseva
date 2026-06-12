import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendBookingStatusEmail } from "@/lib/email";

const schema = z.object({
  action: z.enum(["accept", "decline"]),
  reason: z.string().trim().max(500).optional(),
});

// Provider accepts or declines a daily/instant booking.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const row = await prisma.instantBooking.findUnique({
    where: { id },
    include: {
      provider: { select: { userId: true, user: { select: { name: true } } } },
      customer: { select: { name: true, email: true } },
    },
  });
  if (!row) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (row.provider.userId !== session.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const accepted = parsed.data.action === "accept";
  const reason = parsed.data.reason || null;
  await prisma.instantBooking.update({
    where: { id },
    data: { status: accepted ? "ACCEPTED" : "DECLINED", responseNote: reason },
  });

  if (row.customer.email) {
    sendBookingStatusEmail(row.customer.email, row.customer.name, row.provider.user.name, accepted, reason).catch(
      () => {},
    );
  }

  return NextResponse.json({ ok: true, status: accepted ? "ACCEPTED" : "DECLINED" });
}
