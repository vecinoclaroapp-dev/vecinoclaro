import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, rateLimitResponse, getClientIP } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "USER"]).optional().default("USER"),
});

// POST /api/auth/register
export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = rateLimit(ip, "/api/auth/register");
  if (!rl.allowed) return rateLimitResponse();
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const { name, email, password, role } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email: emailLower,
        password: hashedPassword,
        provider: "credentials",
        role: role === "ADMIN" ? "ADMIN" : "USER",
        onboardingDone: role === "ADMIN" ? false : true,
        onboardingStep: role === "ADMIN" ? 0 : 4,
      },
    });

    return NextResponse.json(
      { ok: true, userId: user.id, email: user.email },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar" },
      { status: 500 },
    );
  }
}
