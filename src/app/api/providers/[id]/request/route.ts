import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendBookingRequestEmail } from "@/lib/email";

const schema = z.object({
  service: z.string().trim().max(40).optional(),
  message: z.string().trim().max(600).optional(),
  preferredTime: z.string().trim().max(80).optional(),
  address: z.string().trim().max(300).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Please log in to send a request" }, { status: 401 });

  const { id: providerId } = await params;
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  if (provider.userId === session.id)
    return NextResponse.json({ error: "You can't request your own profile" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const d = parsed.data;

  await prisma.bookingRequest.upsert({
    where: { customerId_providerId: { customerId: session.id, providerId } },
    create: {
      customerId: session.id,
      providerId,
      service: d.service || null,
      message: d.message || null,
      preferredTime: d.preferredTime || null,
      address: d.address || null,
      status: "PENDING",
    },
    update: {
      service: d.service || null,
      message: d.message || null,
      preferredTime: d.preferredTime || null,
      address: d.address || null,
      status: "PENDING",
    },
  });

  if (provider.user.email) {
    sendBookingRequestEmail(provider.user.email, provider.user.name, session.name, d.service).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
