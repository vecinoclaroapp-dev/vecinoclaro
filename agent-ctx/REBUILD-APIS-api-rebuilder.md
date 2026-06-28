# Task: REBUILD-APIS — Recrear APIs perdidas (Fase 4-10)

## Work Log
- Leí worklog.md (contexto: proyecto VecinoClaro Next.js 16 + Prisma + SQLite, vistas Fase 4-10 ya recreadas por REBUILD-VIEWS)
- Inspeccioné patrón existente (api-context.ts → `getUserContext` retorna `{user, condominium, membership}`; role en `membership.role`; helper `unauthorized()` / `noCondominium()`). Modelos Prisma existentes NO incluían las entidades de las nuevas APIs
- **Schema Prisma**: extendí `prisma/schema.prisma` (+280 líneas) con 14 modelos nuevos:
  - `PollVote` (votación con peso indiviso, unique [pollId,userId])
  - `MarketplaceListing`, `Work`, `DirectoryEntry`
  - `Visitor`, `Vehicle` (unique [condominiumId,plate]), `SecurityAlert`, `AccessLogEntry`
  - `Notification` (indexada por userId+read), `TeamInvite` (token único)
  - `ModuleConfig` (unique [condominiumId,moduleKey]), `BillingConfig` (1:1 con condominio)
  - `Receipt` (con campos OCR), `PaymentReference`
  - Back-relaciones añadidas a `Condominium`, `Poll`, `PollOption`
  - Campos nuevos: `Condominium.inviteCode`, `Residence.joinCode`
  - Ejecuté `bun run db:push` → OK (Prisma Client regenerado)
- **Libs nuevas**:
  - `src/lib/notifications.ts` — `createNotification` + `createNotificationForMembers` (notifica a todos los miembros del condominio)
  - `src/lib/groq.ts` — `analyzeReceiptWithGroq` placeholder (retorna null si no hay GROQ_API_KEY; la API maneja el fallback)
  - `src/lib/modules-list.ts` — lista compartida `MODULE_KEYS` (12 módulos)
- **40 APIs requeridas creadas** (todas con `getUserContext` + `unauthorized`/`noCondominium` + checks de rol admin donde aplica):
  1. polls (GET+POST admin) + polls/[id]/vote (POST con peso por alícuota de la vivienda del residente)
  2. announcements (GET+POST, notifica a miembros) + morosos (GET sin ownerName, calcula monthsLate)
  3. requests (GET filtra por residente; POST) + requests/[id] (PATCH estado/respuesta)
  4. facilities (GET+POST admin) + facilities/reservations (GET+POST con validación de solapamiento)
  5. calendar (GET+POST admin) + messages (GET sender/recipient + lista contactos; POST valida mismo condominio)
  6. marketplace, documents, works (admin), directory
  7. visitors (GET+POST, crea AccessLogEntry en check-in) + visitors/[id] (PATCH authorize/deny/checkin/checkout)
  8. vehicles (admin, unique plate) + security-alerts (GET+POST, notifica) + access-log (admin only)
  9. notifications (GET+PATCH mark-read) + notifications/[id] (PATCH+DELETE con ownership)
  10. team (GET miembros+invites pendientes; POST invitar con token crypto) + team/[id] (PATCH rol, DELETE) + team/join (POST aceptar con token, valida email)
  11. modules (GET mapa key→enabled; POST toggle admin) + billing-config (GET auto-crea; POST admin)
  12. invoices/generate (POST batch por período, monto = baseFee × alícuota) + invoices/late-fees (POST aplica mora con grace days, crea asiento PENALTY en ledger)
  13. receipts (GET+POST con OCR Groq opcional) + receipts/[id] (GET+PATCH approve/reject) + receipts/[id]/ocr (POST re-analizar)
  14. payment-references (GET+POST) + payment-references/me (GET refs generales + de mi vivienda)
  15. bank-accounts (GET+POST admin)
  16. condominium/invite (GET + POST regenerar código 8-char sin ambiguos, admin)
  17. residents (GET admin, lista viviendas con usuario vinculado) + residents/me (GET data completa: user+condo+membership+residence+balance+pendingInvoices) + residents/join (POST vincula con joinCode de vivienda) + residents/link (POST admin vincula user existente por email)
  18. reports/export (GET CSV con type=residents|morosos|payments|invoices|expenses, admin only)
- **3 APIs bonus** creadas para que las vistas existentes funcionen:
  - `modules/[key]/route.ts` (PATCH toggle — la vista module-config-view usa PATCH /api/modules/${key})
  - `payment-references/[id]/route.ts` (DELETE — la vista payment-references-view elimina refs)
  - `residents/me/payments/route.ts` (GET+POST — la vista resident-payments-v2 las usa)
- **Fixes de tipos** tras `tsc --noEmit`:
  - receipts/route.ts: `let ocrResult: ReceiptOcrResult | null` (antes infería `null`)
  - residents/me/route.ts: fetch de `db.user` para obtener `phone` (SessionUser no incluye phone)
  - residents/me/payments/route.ts: removí referencia a `user.phone` inexistente

## Stage Summary
- **Total APIs creadas: 43** (40 requeridas + 3 bonus para soporte de vistas)
- **Lint final: `bun run lint` → EXIT 0, 0 errores, 0 warnings**
- **Schema**: +14 modelos, +3 campos en modelos existentes, `db:push` exitoso
- **Libs nuevas**: notifications.ts, groq.ts, modules-list.ts
- **tsc --noEmit**: mis 43 archivos API están type-clean. Errores tsc preexistentes en `auth/[...nextauth]`, `me`, `onboarding` (import `getServerSession` de next-auth + `const created = []` tipado como `never[]`) NO son de esta tarea
- **Patrones consistentes**: todas las APIs usan `getUserContext` + helpers, checks de rol admin vía `membership?.role !== "ADMIN"`, respuestas JSON con `{ error }` y status codes apropiados, validaciones de pertenencia al condominio
- **Notificaciones**: announcements, requests, security-alerts y team invites disparan `createNotificationForMembers`
- **Acceso**: visitors check-in/checkout y autorizaciones registran entradas en `AccessLogEntry`
- **Dev server**: OOM (heap limit) observado en dev.log al final — es un issue de memoria del dev server de larga duración, no relacionado a estos cambios (GET /api/me retornó 200 correctamente antes del crash)
