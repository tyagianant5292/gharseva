import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Booking requests the logged-in user has sent (customer view).
export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const reqs = await prisma.bookingRequest.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: { id: true, city: true, locality: true, user: { select: { name: true, mobile: true } } },
      },
    },
  });

  return NextResponse.json({
    requests: reqs.map((r) => ({
      id: r.id,
      providerId: r.provider.id,
      providerName: r.provider.user.name,
      providerArea: `${r.provider.locality}, ${r.provider.city}`,
      // Provider's mobile is shown once accepted, so the customer can reach out.
      providerMobile: r.status === "ACCEPTED" ? r.provider.user.mobile : null,
      service: r.service,
      message: r.message,
      preferredTime: r.preferredTime,
      status: r.status,
      responseNote: r.responseNote,
      createdAt: r.createdAt,
    })),
  });
}
