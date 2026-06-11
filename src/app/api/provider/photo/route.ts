import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const imageUrl = z
  .string()
  .regex(/^data:image\/(jpeg|png|webp);base64,/, "Must be an image")
  .max(3_200_000, "Image is too large");

const schema = z.object({
  photoUrl: imageUrl.optional(),
  photoThumbUrl: imageUrl.optional(),
  remove: z.boolean().optional(),
});

// Provider sets / changes / removes their profile photo (separate from verification).
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return NextResponse.json({ error: "Not a provider" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });

  if (parsed.data.remove) {
    await prisma.providerProfile.update({
      where: { userId: session.id },
      data: { photoUrl: null, photoThumbUrl: null },
    });
    return NextResponse.json({ ok: true, photoUrl: null });
  }

  if (!parsed.data.photoUrl)
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });

  await prisma.providerProfile.update({
    where: { userId: session.id },
    data: { photoUrl: parsed.data.photoUrl, photoThumbUrl: parsed.data.photoThumbUrl ?? parsed.data.photoUrl },
  });
  return NextResponse.json({ ok: true, photoUrl: parsed.data.photoUrl });
}
