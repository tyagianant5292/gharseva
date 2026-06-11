import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import type { Prisma } from "@prisma/client";

// Admin: list providers for review. ?status=PENDING|VERIFIED|REJECTED|ALL
export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status") || "PENDING";
  const where: Prisma.ProviderProfileWhereInput = {};
  if (status !== "ALL") where.verificationStatus = status as Prisma.ProviderProfileWhereInput["verificationStatus"];

  const list = await prisma.providerProfile.findMany({
    where,
    take: 100,
    orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true, email: true, mobile: true } } },
  });

  return NextResponse.json({
    providers: list.map((p) => ({
      id: p.id,
      name: p.user.name,
      email: p.user.email,
      mobile: p.user.mobile,
      services: p.services,
      city: p.city,
      locality: p.locality,
      pincode: p.pincode,
      experienceYears: p.experienceYears,
      verified: p.verified,
      verificationStatus: p.verificationStatus,
      verificationNote: p.verificationNote,
      idDocType: p.idDocType,
      idDocUrl: p.idDocUrl,
      idDocBackUrl: p.idDocBackUrl,
      photoUrl: p.photoUrl,
      createdAt: p.createdAt,
    })),
  });
}
