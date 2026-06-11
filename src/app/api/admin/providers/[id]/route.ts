import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { sendVerificationResultEmail } from "@/lib/email";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().trim().max(300).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const approve = parsed.data.action === "approve";
  const note = approve ? null : parsed.data.note || "Documents not accepted.";
  const updated = await prisma.providerProfile.update({
    where: { id },
    data: {
      verified: approve,
      verificationStatus: approve ? "VERIFIED" : "REJECTED",
      verificationNote: note,
    },
    include: { user: { select: { email: true, name: true } } },
  });

  // Notify the helper by email (if they have one). Fire-and-forget.
  if (updated.user.email) {
    sendVerificationResultEmail(updated.user.email, updated.user.name, approve, note).catch(() => {});
  }

  return NextResponse.json({ ok: true, verificationStatus: updated.verificationStatus });
}
