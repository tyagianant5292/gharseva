import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ user: null });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { emailVerified: true },
  });

  return NextResponse.json({
    user: { ...session, emailVerified: dbUser?.emailVerified ?? false },
  });
}
