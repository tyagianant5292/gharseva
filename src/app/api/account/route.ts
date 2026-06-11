import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser, createSession } from "@/lib/auth";
import { newToken, sendVerificationEmail } from "@/lib/email";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, mobile: true, role: true, emailVerified: true },
  });
  return NextResponse.json({ user });
}

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  mobile: z.string().trim().regex(/^[+]?[0-9\s-]{7,15}$/, "Enter a valid mobile number"),
  email: z
    .union([z.string().trim().toLowerCase().email("Invalid email"), z.literal(""), z.undefined()])
    .transform((v) => (v ? v : undefined)),
});

export async function PUT(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const d = parsed.data;

  const me = await prisma.user.findUnique({ where: { id: session.id } });
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Uniqueness checks.
  if (d.mobile !== me.mobile) {
    const taken = await prisma.user.findFirst({ where: { mobile: d.mobile, id: { not: me.id } } });
    if (taken) return NextResponse.json({ error: "That mobile number is already in use" }, { status: 409 });
  }
  const newEmail = d.email ?? null;
  const emailChanged = newEmail !== me.email;
  if (emailChanged && newEmail) {
    const taken = await prisma.user.findFirst({ where: { email: newEmail, id: { not: me.id } } });
    if (taken) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
  }

  // Changing/adding an email requires re-verification.
  const verifyToken = emailChanged && newEmail ? newToken() : undefined;

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: {
      name: d.name,
      mobile: d.mobile,
      email: newEmail,
      ...(emailChanged
        ? { emailVerified: false, emailVerifyToken: verifyToken ?? null }
        : {}),
    },
  });

  if (emailChanged && newEmail && verifyToken) {
    sendVerificationEmail(newEmail, updated.name, verifyToken).catch(() => {});
  }

  // Refresh the session so the navbar / admin checks reflect new name/email.
  await createSession({ id: updated.id, email: updated.email ?? "", name: updated.name, role: updated.role });

  return NextResponse.json({ ok: true, emailChanged: emailChanged && Boolean(newEmail) });
}
