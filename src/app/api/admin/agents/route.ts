import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const agents = await prisma.user.findMany({
      where: { role: "AGENT" },
      select: { id: true, fullName: true, email: true, isActive: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: "desc" },
    });
    return ok({ agents });
  } catch (err) {
    return handleError(err);
  }
}

const createSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { fullName, email, password } = createSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const agent = await prisma.user.create({
      data: { fullName, email, passwordHash, role: "AGENT", referralCode, emailVerified: true },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    });

    return ok({ agent }, 201);
  } catch (err) {
    return handleError(err);
  }
}
