import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/residents — lista de residentes (solo admin)
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede ver residentes" }, { status: 403 });
  }

  const residences = await db.residence.findMany({
    where: { condominiumId: condominium.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, phone: true, image: true } } },
      },
    },
    orderBy: [{ type: "asc" }, { number: "asc" }],
  });

  const data = residences.map((r) => {
    const linkedUser = r.members.find((m) => m.role === "RESIDENT")?.user;
    return {
      id: r.id,
      number: r.number,
      type: r.type,
      aliquot: r.aliquot,
      ownerName: r.ownerName,
      ownerPhone: r.ownerPhone,
      ownerEmail: r.ownerEmail,
      residentName: r.residentName,
      residentPhone: r.residentPhone,
      joinCode: r.joinCode,
      active: r.active,
      linkedUser: linkedUser
        ? {
            id: linkedUser.id,
            name: linkedUser.name,
            email: linkedUser.email,
            phone: linkedUser.phone,
            image: linkedUser.image,
          }
        : null,
    };
  });

  return NextResponse.json(data);
}
