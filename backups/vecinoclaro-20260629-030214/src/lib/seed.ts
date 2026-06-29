// =====================================================================
// Seed de demostración — VecinoClaro
// Ejecutar: bun run src/lib/seed.ts
// =====================================================================

import { db } from "@/lib/db";
import { fetchBcvRate, saveBcvRate, dayOnly } from "@/lib/bcv";
import { appendLedgerEntry } from "@/lib/ledger";
import { usdToVes } from "@/lib/money";

async function main() {
  console.log("🧹 Limpiando BD previa...");
  await db.accountEntry.deleteMany();
  await db.payment.deleteMany();
  await db.serviceCharge.deleteMany();
  await db.invoice.deleteMany();
  await db.residence.deleteMany();
  await db.bcvSync.deleteMany();
  await db.bcvRate.deleteMany();
  await db.condominium.deleteMany();
  await db.user.deleteMany();

  console.log("👤 Creando usuario admin...");
  const admin = await db.user.create({
    data: {
      email: "admin@condominio.ve",
      name: "Junta de Condominio",
      role: "ADMIN",
      phone: "+58 412-5550100",
      // En producción esto sería un hash bcrypt; aquí simplificamos para demo
      password: "$2a$10$demoonlyhashplaceholder12345678901234567890",
    },
  });

  console.log("🏢 Creando condominio...");
  const condo = await db.condominium.create({
    data: {
      name: "Residencias La Trinidad",
      rif: "J-12345678-9",
      address: "Av. Principal de La Trinidad, Urb. La Trinidad, Caracas",
      adminName: "Junta de Condominio",
      adminPhone: "+58 412-5550100",
      baseFeeUSD: 45,
      reserveFund: 1250,
    },
  });

  console.log("💱 Sincronizando tasa BCV...");
  let bcvResult = await fetchBcvRate();
  if (bcvResult.source === "FALLBACK") {
    // Si no hay red, forzamos una tasa de demo
    bcvResult = { rate: 148.32, source: "MANUAL", date: new Date(), message: "Tasa demo" };
  }
  const todayRate = await saveBcvRate(bcvResult);
  console.log(`   Tasa de hoy: ${todayRate.rate} Bs/USD`);

  // Crear tasas históricas para los últimos 30 días (simulando devaluación gradual)
  console.log("📅 Creando historial de tasas (30 días)...");
  const baseRate = todayRate.rate;
  for (let i = 30; i >= 1; i--) {
    const d = dayOnly(new Date(Date.now() - i * 86400000));
    // Simula leve tendencia ascendente (devaluación) hacia el presente
    const rate = Math.round((baseRate - (30 - i) * 0.15) * 100) / 100;
    if (rate > 0) {
      await db.bcvRate.create({
        data: { rate, date: d, source: "BCV" },
      }).catch(() => {});
    }
  }

  console.log("🏠 Creando viviendas...");
  const residences = [
    { number: "PH-A", floor: "PH", type: "APARTMENT", owner: "María Fernández", phone: "+58 414-1002001", email: "maria.f@gmail.com" },
    { number: "PH-B", floor: "PH", type: "APARTMENT", owner: "Carlos Rodríguez", phone: "+58 424-1002002", email: "carlosr@gmail.com" },
    { number: "1-A", floor: "1", type: "APARTMENT", owner: "José Pérez", phone: "+58 412-1002003", email: "jperez@gmail.com" },
    { number: "1-B", floor: "1", type: "APARTMENT", owner: "Ana Martínez", phone: "+58 426-1002004", email: "anam@gmail.com" },
    { number: "2-A", floor: "2", type: "APARTMENT", owner: "Luis Hernández", phone: "+58 414-1002005", email: "luish@gmail.com" },
    { number: "2-B", floor: "2", type: "APARTMENT", owner: "Carmen Díaz", phone: "+58 412-1002006", email: "carmend@gmail.com" },
    { number: "3-A", floor: "3", type: "APARTMENT", owner: "Pedro Gómez", phone: "+58 416-1002007", email: "pedrog@gmail.com" },
    { number: "3-B", floor: "3", type: "APARTMENT", owner: "Rosa López", phone: "+58 424-1002008", email: "rosal@gmail.com" },
    { number: "4-A", floor: "4", type: "APARTMENT", owner: "Miguel Torres", phone: "+58 412-1002009", email: "miguelt@gmail.com" },
    { number: "4-B", floor: "4", type: "APARTMENT", owner: "Lucía Ramírez", phone: "+58 426-1002010", email: "luciar@gmail.com" },
    { number: "L-01", floor: "PB", type: "LOCAL", owner: "Inversiones La Trinidad C.A.", phone: "+58 212-5553300", email: "admin@invtrinidad.com" },
    { number: "L-02", floor: "PB", type: "LOCAL", owner: "Farmacia San Rafael C.A.", phone: "+58 212-5553400", email: "gerencia@farmacasanrafael.com" },
  ];

  const createdResidences = [];
  for (const r of residences) {
    const residence = await db.residence.create({
      data: {
        condominiumId: condo.id,
        number: r.number,
        floor: r.floor,
        type: r.type,
        ownerName: r.owner,
        ownerPhone: r.phone,
        ownerEmail: r.email,
        active: true,
      },
    });
    createdResidences.push(residence);
  }
  console.log(`   ${createdResidences.length} viviendas creadas`);

  console.log("📄 Generando facturas de mantenimiento (3 meses)...");
  const now = new Date();
  const months = [
    { y: now.getFullYear(), m: now.getMonth() + 1, label: "actual" },
    { y: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), m: now.getMonth() === 0 ? 12 : now.getMonth(), label: "anterior" },
    {
      y: now.getMonth() <= 1 ? now.getFullYear() - 1 : now.getFullYear(),
      m: now.getMonth() <= 1 ? 12 - (1 - now.getMonth()) : now.getMonth() - 1,
      label: "hace 2 meses",
    },
  ];

  for (const res of createdResidences) {
    for (const month of months) {
      const period = `${month.y}-${String(month.m).padStart(2, "0")}`;
      const periodDate = new Date(month.y, month.m - 1, 5);
      const rateForPeriod = await db.bcvRate.findFirst({
        where: { date: { lte: periodDate } },
        orderBy: { date: "desc" },
      });
      const rate = rateForPeriod ?? todayRate;
      const baseFee = res.type === "LOCAL" ? condo.baseFeeUSD * 2.5 : condo.baseFeeUSD;
      const amountUSD = baseFee;
      const amountVES = usdToVes(amountUSD, rate.rate);

      const invoice = await db.invoice.create({
        data: {
          residenceId: res.id,
          period,
          amountUSD,
          amountVES,
          bcvRateId: rate.id,
          dueDate: new Date(month.y, month.m, 5),
          status: "PENDING",
        },
      });

      // Asiento DEBIT (cargo) en el ledger inmutable
      await appendLedgerEntry({
        residenceId: res.id,
        type: "DEBIT",
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
        concept: `Mantenimiento ${period}`,
        category: "MAINTENANCE",
        reference: invoice.period,
        date: periodDate,
        invoiceId: invoice.id,
      });
    }
  }

  console.log("💳 Registrando pagos históricos...");
  const paymentMethods = [
    { method: "PAGO_MOVIL", bank: "Banesco", currency: "VES" as const },
    { method: "TRANSFERENCIA_NAC", bank: "Banco de Venezuela (BDV)", currency: "VES" as const },
    { method: "ZELLE", bank: null, currency: "USD" as const },
    { method: "EFECTIVO", bank: null, currency: "BOTH" as const },
  ];

  let paymentsCount = 0;
  // Pagamos las facturas de hace 2 meses y del mes anterior para ~70% de las viviendas
  for (const res of createdResidences) {
    // Saltar 2 viviendas para mostrar saldos pendientes
    if (res.number === "3-B" || res.number === "4-A") continue;

    for (let mi = 1; mi <= 2; mi++) {
      // meses 1 y 2 atrás (no el actual)
      const month = months[mi];
      const period = `${month.y}-${String(month.m).padStart(2, "0")}`;
      const periodDate = new Date(month.y, month.m - 1, 5);

      const invoice = await db.invoice.findUnique({
        where: { residenceId_period: { residenceId: res.id, period } },
      });
      if (!invoice) continue;

      const rateForPeriod = await db.bcvRate.findFirst({
        where: { date: { lte: periodDate } },
        orderBy: { date: "desc" },
      });
      const rate = rateForPeriod ?? todayRate;
      const pm = paymentMethods[paymentsCount % paymentMethods.length];

      // Fecha de pago: 3-15 días después del vencimiento
      const payDate = new Date(month.y, month.m - 1, 5 + 3 + (paymentsCount % 10));

      const amountUSD = invoice.amountUSD;
      const amountVES = usdToVes(amountUSD, rate.rate);

      const payment = await db.payment.create({
        data: {
          residenceId: res.id,
          amountUSD,
          amountVES,
          bcvRateId: rate.id,
          method: pm.method,
          reference: pm.method === "ZELLE" ? `ZEL-${1000000 + paymentsCount}` : `REF-${10000000 + paymentsCount}`,
          bankOrigin: pm.bank,
          payerPhone: res.ownerPhone,
          payerName: res.ownerName,
          concept: `Pago mantenimiento ${period}`,
          category: "MAINTENANCE",
          status: "CONFIRMED",
          date: payDate,
          recordedById: admin.id,
        },
      });

      // Asiento CREDIT (abono) encadenado
      await appendLedgerEntry({
        residenceId: res.id,
        type: "CREDIT",
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
        concept: `Pago ${period} — ${pm.method}`,
        category: "PAYMENT",
        reference: payment.reference,
        date: payDate,
        paymentId: payment.id,
      });

      // Marcar factura como pagada
      await db.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAmountUSD: amountUSD },
      });

      paymentsCount++;
    }
  }
  console.log(`   ${paymentsCount} pagos registrados`);

  console.log("⚡ Creando cargos de servicios críticos...");
  // Cargo de planta eléctrica prorrateado (residenceId null = todas)
  const plantCharge = await db.serviceCharge.create({
    data: {
      condominiumId: condo.id,
      residenceId: null, // prorrateado
      type: "ELECTRIC_PLANT",
      title: "Combustible planta eléctrica — Junio",
      description: "Reposición de diésel para planta eléctrica. Prorrateado entre todas las viviendas según alícuota.",
      amountUSD: 12,
      amountVES: usdToVes(12, todayRate.rate),
      bcvRateId: todayRate.id,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      status: "PENDING",
      createdById: admin.id,
    },
  });

  // Cargo de pozo de agua
  await db.serviceCharge.create({
    data: {
      condominiumId: condo.id,
      residenceId: null,
      type: "WATER_WELL",
      title: "Mantenimiento pozo de agua — Trimestral",
      description: "Limpieza, cloración y revisión de bomba sumergible.",
      amountUSD: 18,
      amountVES: usdToVes(18, todayRate.rate),
      bcvRateId: todayRate.id,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
      status: "PENDING",
      createdById: admin.id,
    },
  });

  // Contingencia específica a una vivienda (rotura de tubería)
  await db.serviceCharge.create({
    data: {
      condominiumId: condo.id,
      residenceId: createdResidences.find((r) => r.number === "2-A")!.id,
      type: "CONTINGENCY",
      title: "Reparación tubería agua apto 2-A",
      description: "Rotura de tubería interna que afectó paredes comunes. Cargo directo al propietario.",
      amountUSD: 85,
      amountVES: usdToVes(85, todayRate.rate),
      bcvRateId: todayRate.id,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      status: "PENDING",
      createdById: admin.id,
    },
  });

  // Generar asientos DEBIT por los cargos prorrateados a cada vivienda
  for (const res of createdResidences) {
    if (res.type === "LOCAL") {
      // Locales pagan 2.5x
      const amt = plantCharge.amountUSD * 2.5;
      await appendLedgerEntry({
        residenceId: res.id,
        type: "DEBIT",
        amountUSD: amt,
        amountVES: usdToVes(amt, todayRate.rate),
        bcvRateId: todayRate.id,
        concept: plantCharge.title,
        category: "SERVICE_CHARGE",
        reference: plantCharge.id,
        date: new Date(),
        serviceChargeId: plantCharge.id,
      });
    } else {
      await appendLedgerEntry({
        residenceId: res.id,
        type: "DEBIT",
        amountUSD: plantCharge.amountUSD,
        amountVES: usdToVes(plantCharge.amountUSD, todayRate.rate),
        bcvRateId: todayRate.id,
        concept: plantCharge.title,
        category: "SERVICE_CHARGE",
        reference: plantCharge.id,
        date: new Date(),
        serviceChargeId: plantCharge.id,
      });
    }
  }

  // Y la contingencia directa al 2-A
  await appendLedgerEntry({
    residenceId: createdResidences.find((r) => r.number === "2-A")!.id,
    type: "DEBIT",
    amountUSD: 85,
    amountVES: usdToVes(85, todayRate.rate),
    bcvRateId: todayRate.id,
    concept: "Reparación tubería agua apto 2-A",
    category: "SERVICE_CHARGE",
    reference: "CONTINGENCY-2A",
    date: new Date(),
    serviceChargeId: (await db.serviceCharge.findFirst({ where: { type: "CONTINGENCY" } }))!.id,
  });

  console.log("✅ Seed completado");
  console.log(`   - ${createdResidences.length} viviendas`);
  console.log(`   - ${paymentsCount} pagos`);
  console.log(`   - 3 cargos de servicios críticos`);
  console.log(`   - Tasa BCV: ${todayRate.rate} Bs/USD`);

  await db.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
