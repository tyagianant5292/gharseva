import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  if (!token || typeof token !== "string")
    return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { emailVerifyToken: token },
    include: { provider: true },
  });
  if (!user) {
    return NextResponse.json({ error: "This link is invalid or already used." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });

  // In the UAE we don't collect ID documents — a confirmed email is what grants
  // the Verified badge. (In India, the Verified badge stays admin-doc-approved.)
  if (user.provider && user.provider.country === "AE" && !user.provider.verified) {
    await prisma.providerProfile.update({
      where: { id: user.provider.id },
      data: { verified: true, verificationStatus: "VERIFIED" },
    });
  }

  return NextResponse.json({ ok: true });
}
