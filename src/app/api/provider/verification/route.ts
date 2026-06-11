import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// data URL up to ~3MB (base64). Keeps DB rows reasonable for the MVP.
const dataUrl = z
  .string()
  .regex(/^data:image\/(jpeg|png|webp);base64,/, "Must be a JPEG/PNG/WebP image")
  .max(3_000_000, "Image is too large");

const schema = z.object({
  idDocType: z.string().trim().min(2).max(40),
  idDocUrl: dataUrl,
  photoUrl: dataUrl.optional(),
});

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (session.role !== "PROVIDER")
    return NextResponse.json({ error: "Only providers can submit verification" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  await prisma.providerProfile.update({
    where: { userId: session.id },
    data: {
      idDocType: d.idDocType,
      idDocUrl: d.idDocUrl,
      ...(d.photoUrl ? { photoUrl: d.photoUrl } : {}),
      // Submitting (or re-submitting) puts the provider back in the review queue.
      verified: false,
      verificationStatus: "PENDING",
      verificationNote: null,
    },
  });

  return NextResponse.json({ ok: true, status: "PENDING" });
}
