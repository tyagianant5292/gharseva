import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Incoming booking requests for the logged-in provider.
export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return NextResponse.json({ requests: [] });

  const reqs = await prisma.bookingRequest.findMany({
    where: { providerId: profile.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { customer: { select: { name: true, mobile: true, email: true } } },
  });

  return NextResponse.json({
    requests: reqs.map((r) => ({
      id: r.id,
      customerName: r.customer.name,
      customerMobile: r.customer.mobile,
      customerEmail: r.customer.email,
      service: r.service,
      message: r.message,
      preferredTime: r.preferredTime,
      status: r.status,
      responseNote: r.responseNote,
      createdAt: r.createdAt,
    })),
  });
}
