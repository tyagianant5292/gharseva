import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const { identifier, password } = parsed.data;
  const id = identifier.trim();
  const looksLikeEmail = id.includes("@");

  // Look up by email or by mobile number.
  const user = looksLikeEmail
    ? await prisma.user.findUnique({ where: { email: id.toLowerCase() } })
    : await prisma.user.findFirst({ where: { mobile: id } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid login or password" }, { status: 401 });
  }

  await createSession({ id: user.id, email: user.email ?? "", name: user.name, role: user.role });
  return NextResponse.json({ ok: true, role: user.role });
}
