import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

// Admin: list non-helper users (customers — people looking for help, plus admins).
export async function GET() {
  const session = await getSessionUser();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { provider: { is: null } },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { contactViews: true } },
    },
  });

  return NextResponse.json({
    customers: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      contactsUnlocked: u._count.contactViews,
    })),
  });
}
