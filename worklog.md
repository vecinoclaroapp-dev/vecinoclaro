---
Task ID: ALL
Agent: main (Z.ai Code)
Task: Construir CondominioDigital VE — SaaS bimonetario de gestión inmobiliaria para Venezuela

Work Log:
- Diseñé schema Prisma bimonetario con 8 modelos: User, Condominium, Residence, BcvRate, BcvSync, Payment, AccountEntry (hash chain SHA-256), ServiceCharge, Invoice
- Push del schema a SQLite + generación de Prisma Client
- Tema visual custom: emerald primario (confianza/finanzas) + amber acento (bandera VE), con tokens semánticos bimonetarios (--usd, --ves, --success, --warning), dark mode completo
- Librerías core: constants.ts (métodos de pago VE, bancos venezolanos, tipos de servicio), money.ts (formato bimonetario es-VE, conversión USD↔VES, saldos), bcv.ts (scraper multi-fuente con fallback), ledger.ts (hash chain SHA-256 inmutable)
- Seed de demo: 1 condominio, 12 viviendas (10 aptos + 2 locales), historial BCV 30 días, 20 pagos históricos, 3 cargos de servicios críticos (planta/pozo/contingencia), asientos contables encadenados
- APIs REST completas: /api/bcv (GET+POST sync), /api/bcv/history, /api/condominium, /api/residences (GET+POST+[id] PATCH+DELETE), /api/payments (GET+POST con asiento automático), /api/ledger, /api/services (GET+POST con prorrateo+[id] PATCH), /api/dashboard (métricas agregadas), /api/invoices
- Shell de la app: Sidebar con 8 secciones + Topbar con widget BCV siempre visible + botón sincronizar + footer sticky
- Hooks React Query: useBcvRate, useSyncBcv, useBcvHistory, useDashboard, useCondominium, useResidences, useCreateResidence, useUpdateResidence, useDeleteResidence, usePayments, useCreatePayment, useLedger, useServices, useCreateService, useUpdateService, useInvoices
- 8 vistas SPA: Dashboard (stats + gráficos + widget BCV), Viviendas (CRUD), Pagos (formulario localizado VE con conversión automática), Libro Contable (hash chain visualizado), Servicios Críticos (por tipo con prorrateo), Facturas, Reportes (gráficos + export CSV), Ajustes
- Lint: 0 errores, 0 warnings
- Verificación end-to-end con Agent Browser:
  * Dashboard carga con datos bimonetarios (USD + Bs.S)
  * Navegación SPA entre todas las vistas funciona
  * Creé un pago real: vivienda 1-A, Pago Móvil, USD 50 → VES 7.416 (auto), ref REF-TEST-001, BDV → registrado y asentado en ledger
  * Libro Contable muestra el nuevo asiento con hash encadenado verificado (5d0860bba7007423 ← b55bb77dac52)
  * Responsividad móvil verificada (390×844): sidebar colapsable, stats apilados
  * BCV sync funciona (POST /api/bcv 200)
  * Sin errores en consola ni runtime

Stage Summary:
- Aplicación fullstack completa y verificada end-to-end
- Arquitectura bimonetaria real: toda transacción guarda USD+VES+snapshot de tasa BCV
- Ledger inmutable con hash chain SHA-256 (criptográficamente auditable)
- Pasarela localizada VE: Pago Móvil, Transferencia Nacional, Zelle, Efectivo + 20 bancos venezolanos
- Módulo de servicios críticos con prorrateo automático (locales pagan 2.5×)
- Dashboard con métricas consolidadas, gráficos (Recharts), top morosos, distribución por método
- Exportación CSV de reportes
- Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + Prisma/SQLite + React Query + Zustand + Recharts
- Cumple todas las reglas: ruta única /, no indigo/blue, footer sticky, responsive, accesible

---
Task ID: FASE-2
Agent: main (Z.ai Code)
Task: Fase 2 — Auth, landing, onboarding, data en 0, principios Anthropic, ampliación schema

Work Log:
- Evalué honestamente las 4 solicitudes del usuario: MCP 21st Dev (NO posible en CLI sandbox), repo Anthropic skills (SÍ, clonado), API Cryptocompare (key inválida para VES, fallback a tasa manual), data en 0 (SÍ), landing+auth (SÍ), onboarding (SÍ)
- Cloné anthropics/skills a /tmp, leí frontend-design + brand-guidelines, aplico principios (hero con tesis, tipografía con carácter, copy desde lado del usuario)
- Amplié schema Prisma: 8 modelos → 24 modelos (User con onboarding, Account/Session/VerificationToken para NextAuth, CondominiumMember, Supplier, Expense, AccountPayable, BankAccount, Fund, Budget, AdminTask, Announcement, CalendarEvent, Facility, FacilityReservation, Poll/PollOption, ResidentRequest, Document, Message)
- Reset BD a estado limpio (sin seed de demo) — data en 0 como exigió el usuario
- Configuré NextAuth.js v4 con CredentialsProvider + GoogleProvider (condicional a env vars)
- Instalé bcryptjs para hash de passwords
- Creé APIs: /api/auth/register, /api/auth/[...nextauth], /api/me (GET+PATCH), /api/onboarding (4 pasos)
- Helper getUserContext() para scoping por condominio del usuario autenticado
- Actualicé TODAS las APIs existentes (condominium, residences, dashboard, payments, ledger, services, invoices) para requerir auth + scope por condominio
- Pantalla AuthScreen con dual-panel: lado izquierdo brand con hero+features, lado derecho form login/registro con tabs
- OnboardingWizard de 4 pasos: (1) Condominio, (2) Viviendas en batch, (3) Tasa BCV (sync + manual fallback), (4) ¡Listo!
- page.tsx con renderizado condicional: no auth → AuthScreen, onboarding pendiente → Wizard, completo → App
- Sidebar actualizado con avatar de usuario + botón logout
- Refactoricé payments-view: conversión bimonetaria derivada (no useEffect con setState) para cumplir reglas React 19
- Lint: 0 errores, 0 warnings
- Verificación end-to-end con Agent Browser:
  * Pantalla auth carga (login + registro + Google condicional)
  * Registro de cuenta: admin3@testcondo.ve / test123 → 201 Created
  * Auto-login tras registro → wizard aparece
  * Paso 1: creó "Residencias El Sol" J-98765432-1, cuota 40 USD
  * Paso 2: cargó vivienda 1-A (Pedro Pérez)
  * Paso 3: tasa manual 150.50 Bs/USD (BCV no responde desde sandbox)
  * Paso 4: onboarding completado
  * Entró al panel: dashboard con TODO EN 0 (USD 0,00 / Bs.S 0,00 en por cobrar, cobrado, morosas, servicios)
  * Vista Viviendas muestra 1-A con saldo 0,00 y estado "Al día"
  * Sin errores en consola ni dev log

Stage Summary:
- Sistema convertido de demo con seed a SaaS real: data en 0, onboarding guiado, multi-condominio
- Auth completo: Credentials + Google OAuth (configurable via env)
- 24 modelos en schema (vs 8 antes) — soporta todas las funciones de Vivook
- Aplicados principios de diseño Anthropic (hero con tesis, signature element, copy user-centric)
- Restricción de ruta única / respetada: renderizado condicional en page.tsx
- Funciones Vivook pendientes para Fase 3: Gastos/Proveedores, Presupuesto, Fondos, Cuentas por pagar, Comunicaciones (11 sub-funciones)
