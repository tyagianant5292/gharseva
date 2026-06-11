import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Provider toggles their own profile on/off (disabled profiles are hidden from search).
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return NextResponse.json({ error: "Not a provider" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = z.object({ available: z.boolean() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.providerProfile.update({
    where: { userId: session.id },
    data: { available: parsed.data.available },
  });

  return NextResponse.json({ ok: true, available: parsed.data.available });
}
