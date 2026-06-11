import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

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
  const updated = await prisma.providerProfile.update({
    where: { id },
    data: {
      verified: approve,
      verificationStatus: approve ? "VERIFIED" : "REJECTED",
      verificationNote: approve ? null : parsed.data.note || "Documents not accepted.",
    },
  });

  return NextResponse.json({ ok: true, verificationStatus: updated.verificationStatus });
}
