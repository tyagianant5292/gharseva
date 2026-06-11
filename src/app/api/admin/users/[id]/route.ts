import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

// Admin deletes any user by id (cascades provider profile + contact views).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session!.id)
    return NextResponse.json({ error: "You can't delete your own admin account." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
