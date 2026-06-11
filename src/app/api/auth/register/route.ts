import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { newToken, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Email is optional, but unique when given.
  if (d.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: d.email } });
    if (byEmail)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }
  // Mobile is the primary identity — must be unique.
  const byMobile = await prisma.user.findFirst({ where: { mobile: d.mobile } });
  if (byMobile)
    return NextResponse.json({ error: "An account with this mobile number already exists" }, { status: 409 });

  const passwordHash = await hashPassword(d.password);
  const verifyToken = d.email ? newToken() : null;

  const user = await prisma.user.create({
    data: {
      name: d.name,
      email: d.email ?? null,
      mobile: d.mobile,
      passwordHash,
      role: d.role,
      emailVerifyToken: verifyToken,
      // Provider: create profile. "Verified" = email + mobile both present (MVP policy).
      provider:
        d.role === "PROVIDER"
          ? {
              create: {
                services: d.services ?? [],
                city: d.city ?? "",
                locality: d.locality ?? "",
                pincode: d.pincode ?? "",
                gender: d.gender || null,
                experienceYears: d.experienceYears ?? 0,
                expectedSalary: d.expectedSalary ?? null,
                bio: d.bio || null,
                // Starts unverified — provider uploads ID, admin approves.
                verified: false,
                verificationStatus: "PENDING",
              },
            }
          : undefined,
    },
  });

  // Fire-and-forget verification email — only if an email was provided.
  if (user.email && verifyToken) {
    sendVerificationEmail(user.email, user.name, verifyToken).catch(() => {});
  }

  await createSession({ id: user.id, email: user.email ?? "", name: user.name, role: user.role });

  return NextResponse.json({ ok: true, role: user.role, hasEmail: Boolean(user.email) });
}
