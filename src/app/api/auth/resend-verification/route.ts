import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { newToken, sendVerificationEmail, emailEnabled } from "@/lib/email";

export async function POST() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!user.email) return NextResponse.json({ ok: true, noEmail: true });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const token = newToken();
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: token } });
  const sent = await sendVerificationEmail(user.email, user.name, token);

  return NextResponse.json({ ok: true, sent, enabled: emailEnabled() });
}
