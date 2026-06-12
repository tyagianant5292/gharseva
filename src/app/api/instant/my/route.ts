import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Daily/instant bookings the logged-in customer has made.
export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const rows = await prisma.instantBooking.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: { id: true, city: true, locality: true, country: true, user: { select: { name: true, mobile: true } } },
      },
    },
  });

  return NextResponse.json({
    bookings: rows.map((r) => ({
      id: r.id,
      providerId: r.provider.id,
      providerName: r.provider.user.name,
      providerArea: `${r.provider.locality}, ${r.provider.city}`,
      country: r.provider.country,
      // Provider mobile revealed once accepted.
      providerMobile: r.status === "ACCEPTED" ? r.provider.user.mobile : null,
      service: r.service,
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      ratePerDay: r.ratePerDay,
      totalAmount: r.totalAmount,
      status: r.status,
      responseNote: r.responseNote,
      createdAt: r.createdAt,
    })),
  });
}
