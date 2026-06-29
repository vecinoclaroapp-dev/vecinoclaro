import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchBcvRate, saveBcvRate } from "@/lib/bcv";
import { usdToVes, round2 } from "@/lib/money";

// POST /api/onboarding — ejecuta un paso del onboarding
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const step = body.step;

  try {
    if (step === "condominium") {
      // Paso 1: crear condominio + membresía
      if (!body.name || !body.rif) {
        return NextResponse.json({ error: "Nombre y RIF son obligatorios" }, { status: 400 });
      }

      const condo = await db.condominium.create({
        data: {
          name: body.name.trim(),
          rif: body.rif.trim().toUpperCase(),
          address: body.address?.trim() || "",
          city: body.city?.trim() || null,
          adminName: body.adminName?.trim() || session.user.name,
          adminPhone: body.adminPhone?.trim() || null,
          adminEmail: body.adminEmail?.trim() || session.user.email,
          baseFeeUSD: Number(body.baseFeeUSD) || 0,
          setupComplete: false,
        },
      });

      await db.condominiumMember.create({
        data: {
          userId: session.user.id,
          condominiumId: condo.id,
          role: "ADMIN",
          acceptedAt: new Date(),
        },
      });

      await db.user.update({
        where: { id: session.user.id },
        data: { onboardingStep: 1 },
      });

      return NextResponse.json({ ok: true, condominiumId: condo.id });
    }

    if (step === "residences") {
      // Paso 2: crear viviendas en batch
      const membership = await db.condominiumMember.findFirst({
        where: { userId: session.user.id },
      });
      if (!membership) {
        return NextResponse.json({ error: "Primero debe crear el condominio" }, { status: 400 });
      }
      const residences = Array.isArray(body.residences) ? body.residences : [];
      if (residences.length === 0) {
        return NextResponse.json({ error: "Agregue al menos una vivienda" }, { status: 400 });
      }

      const created = [];
      for (const r of residences) {
        if (!r.number) continue;
        try {
          const res = await db.residence.create({
            data: {
              condominiumId: membership.condominiumId,
              number: String(r.number).trim().toUpperCase(),
              floor: r.floor?.trim() || null,
              type: r.type || "APARTMENT",
              aliquot: Number(r.aliquot) || 1,
              ownerName: r.ownerName?.trim() || null,
              ownerPhone: r.ownerPhone?.trim() || null,
              ownerEmail: r.ownerEmail?.trim() || null,
              active: true,
            },
          });
          created.push(res);
        } catch {
          // duplicado: ignorar
        }
      }

      await db.user.update({
        where: { id: session.user.id },
        data: { onboardingStep: 2 },
      });

      return NextResponse.json({ ok: true, count: created.length });
    }

    if (step === "bcv") {
      // Paso 3: sincronizar tasa BCV
      const result = await fetchBcvRate();
      let saved;
      if (result.source === "FALLBACK" && body.manualRate) {
        // usar tasa manual si BCV no responde
        saved = await saveBcvRate({
          rate: Number(body.manualRate),
          source: "MANUAL",
          date: new Date(),
        });
      } else {
        saved = await saveBcvRate(result);
      }

      await db.user.update({
        where: { id: session.user.id },
        data: { onboardingStep: 3 },
      });

      return NextResponse.json({ ok: true, rate: saved.rate, source: saved.source });
    }

    if (step === "complete") {
      // Paso final: marcar onboarding como completo
      const membership = await db.condominiumMember.findFirst({
        where: { userId: session.user.id },
      });
      if (membership) {
        await db.condominium.update({
          where: { id: membership.condominiumId },
          data: { setupComplete: true },
        });
      }
      await db.user.update({
        where: { id: session.user.id },
        data: { onboardingDone: true, onboardingStep: 4 },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Paso inválido" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en onboarding" },
      { status: 500 },
    );
  }
}
