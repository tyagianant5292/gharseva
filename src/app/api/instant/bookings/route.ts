import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Incoming daily/instant bookings for the logged-in provider.
export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return NextResponse.json({ bookings: [] });

  const rows = await prisma.instantBooking.findMany({
    where: { providerId: profile.id },
    orderBy: [{ status: "asc" }, { startDate: "asc" }],
    include: {
      customer: {
        select: {
          name: true,
          mobile: true,
          email: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { bookingRequests: true, instantBookings: true } },
        },
      },
    },
  });

  return NextResponse.json({
    country: profile.country,
    bookings: rows.map((r) => ({
      id: r.id,
      customerName: r.customer.name,
      customerMobile: r.customer.mobile,
      customerEmail: r.customer.email,
      customerEmailVerified: r.customer.emailVerified,
      customerSince: r.customer.createdAt,
      customerBookings: r.customer._count.bookingRequests + r.customer._count.instantBookings,
      service: r.service,
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      ratePerDay: r.ratePerDay,
      totalAmount: r.totalAmount,
      message: r.message,
      address: r.address,
      status: r.status,
      responseNote: r.responseNote,
      createdAt: r.createdAt,
    })),
  });
}
