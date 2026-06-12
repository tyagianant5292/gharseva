import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendInstantBookingRequestEmail } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { serviceLabel } from "@/lib/services";
import { asRates } from "@/lib/instant";

const schema = z.object({
  providerId: z.string().min(1),
  service: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a start date"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick an end date"),
  message: z.string().trim().max(600).optional(),
});

// Number of calendar days in an inclusive [start, end] range.
function inclusiveDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

// Customer books a provider for a date range (daily / instant service).
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Please log in to book." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const d = parsed.data;

  const start = new Date(`${d.startDate}T00:00:00`);
  const end = new Date(`${d.endDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  if (start < today) return NextResponse.json({ error: "Start date can't be in the past." }, { status: 400 });
  if (end < start) return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });

  const days = inclusiveDays(start, end);
  if (days > 60) return NextResponse.json({ error: "Bookings are limited to 60 days." }, { status: 400 });

  const provider = await prisma.providerProfile.findUnique({
    where: { id: d.providerId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!provider || !provider.available)
    return NextResponse.json({ error: "Helper not found." }, { status: 404 });
  if (!provider.instantAvailable)
    return NextResponse.json({ error: "This helper isn't available for daily bookings." }, { status: 400 });
  if (provider.userId === session.id)
    return NextResponse.json({ error: "You can't book yourself." }, { status: 400 });

  // Rate depends on the chosen service.
  const rates = asRates(provider.instantRates);
  const ratePerDay = rates[d.service];
  if (!ratePerDay || ratePerDay <= 0)
    return NextResponse.json({ error: "This helper isn't available for that service by the day." }, { status: 400 });

  const totalAmount = ratePerDay * days;

  const booking = await prisma.instantBooking.create({
    data: {
      customerId: session.id,
      providerId: provider.id,
      service: d.service,
      startDate: start,
      endDate: end,
      days,
      ratePerDay,
      totalAmount,
      message: d.message || null,
      status: "PENDING",
    },
  });

  if (provider.user.email) {
    const range =
      d.startDate === d.endDate ? d.startDate : `${d.startDate} → ${d.endDate}`;
    sendInstantBookingRequestEmail(
      provider.user.email,
      provider.user.name,
      session.name,
      serviceLabel(d.service),
      range,
      days,
      formatMoney(totalAmount, provider.country),
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: booking.id, days, totalAmount });
}
