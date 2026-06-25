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
