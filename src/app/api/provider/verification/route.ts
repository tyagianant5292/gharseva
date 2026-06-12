import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendAdminVerificationAlert } from "@/lib/email";

// data URL (image or PDF) up to ~3MB base64. Keeps DB rows reasonable for the MVP.
const docUrl = z
  .string()
  .regex(
    /^data:(image\/(jpeg|png|webp)|application\/pdf);base64,/,
    "Must be an image (JPG/PNG) or PDF",
  )
  .max(3_200_000, "File is too large");

const imageUrl = z
  .string()
  .regex(/^data:image\/(jpeg|png|webp);base64,/, "Must be an image")
  .max(3_200_000, "Image is too large");

const schema = z.object({
  idDocType: z.string().trim().min(2).max(40),
  idDocUrl: docUrl,
  idDocBackUrl: docUrl.optional(),
  photoUrl: imageUrl.optional(),
  photoThumbUrl: imageUrl.optional(),
});

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Source of truth is the DB profile, not the (possibly stale) JWT role claim.
  const existing = await prisma.providerProfile.findUnique({ where: { userId: session.id } });
  if (!existing)
    return NextResponse.json(
      { error: "Only providers can submit verification. Please register as a helper." },
      { status: 403 },
    );

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
      idDocBackUrl: d.idDocBackUrl ?? null,
      ...(d.photoUrl ? { photoUrl: d.photoUrl, photoThumbUrl: d.photoThumbUrl ?? d.photoUrl } : {}),
      // Submitting (or re-submitting) puts the provider back in the review queue.
      verified: false,
      verificationStatus: "PENDING",
      verificationNote: null,
    },
  });

  // Notify the admin that there's a document to review (fire-and-forget).
  sendAdminVerificationAlert(session.name, d.idDocType).catch(() => {});

  return NextResponse.json({ ok: true, status: "PENDING" });
}
