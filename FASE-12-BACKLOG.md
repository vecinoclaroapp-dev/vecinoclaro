# Fase 12 — Backlog Exhaustivo de Bugs y Problemas Grandes

Auditoría profunda realizada por 3 agentes en paralelo sobre:
- 30 vistas del admin
- 10 componentes del portal residente
- 63 APIs REST
- Libs críticas (auth, ledger, bcv, notifications, groq, modules)

**Total de bugs detectados: 276**
- CRÍTICOS: 49
- ALTOS: 71
- MEDIOS: 107
- BAJOS: 49

---

## 🔴 P0 — BUGS CRÍTICOS (bloquean release, seguridad o funcionalidad núcleo)

### A. Seguridad / Acceso no autenticado (5 bugs)

1. **`/api/residences/[id]` PATCH sin autenticación ni multi-tenant** — Cualquiera en internet con el `id` de una vivienda puede modificar `number`, `ownerName`, `ownerEmail`, `active`. No llama `getUserContext()`, no filtra por `condominiumId`.
2. **`/api/residences/[id]` DELETE sin autenticación ni multi-tenant** — Cualquiera puede soft-delete (`active: false`) cualquier vivienda del sistema.
3. **`/api/services/[id]` PATCH sin autenticación ni multi-tenant** — Cualquiera puede cambiar `status` y `dueDate` de cargos de servicio.
4. **`/api/auth/[...nextauth]` callback `signIn` crea usuarios Google con `role: "ADMIN"`** — Si Google OAuth está habilitado, cualquier cuenta Google se vuelve admin global.
5. **`/api/auth/register` POST hardcodea `role: "ADMIN"` en todo auto-registro** — Escalada de privilegios. El rol default debería ser `USER` o `RESIDENT`; sólo promover a `ADMIN` al crear el primer condominio.

### B. Funcionalidad núcleo rota (5 bugs)

6. **`Residence.joinCode` nunca se genera** — Ni onboarding ni `/api/residences` POST generan `joinCode`. El flujo `/api/residents/join` SIEMPRE devuelve 404. **El portal residente es inalcanzable.**
7. **`/api/invoices/generate` no crea asientos DEBIT en el ledger** — Las facturas generadas no afectan saldos. Las viviendas nunca aparecen morosas por facturación mensual.
8. **`/api/invoices/late-fees` no idempotente + no actualiza Invoice** — Cada POST crea moras duplicadas. La factura no refleja el cargo de mora.
9. **`/api/receipts/[id]` PATCH approve no crea Payment ni asiento contable** — Aprobar un comprobante solo cambia `status: "APPROVED"`. El saldo de la vivienda no se actualiza. **Flujo "residente sube comprobante → admin aprueba → saldo actualizado" completamente roto.**
10. **`/api/expenses` POST no crea asiento contable** — Los gastos no se reflejan en el ledger. Reportes vs libro contable inconsistentes.

### C. Integridad de la hash chain SHA-256 (4 bugs)

11. **`/api/payments` POST no transaccional entre `payment.create` y `appendLedgerEntry`** — Si el ledger falla, el pago queda huérfano sin asiento contable.
12. **`/api/services` POST no transaccional: charge.create + N×appendLedgerEntry sin `$transaction`** — Prorrateo parcial si falla una vivienda.
13. **`/api/invoices/late-fees` POST no transaccional: N×appendLedgerEntry sin `$transaction`** — Moras huérfanas si falla una.
14. **`src/lib/ledger.ts` `appendLedgerEntry` race condition en hash chain** — Read-then-write de `last.hash` no es atómico. Concurrencia rompe la cadena SHA-256. El `tx` no se pasa a la función.

### D. Autorización / Permisos (5 bugs)

15. **`/api/services` POST no verifica rol ADMIN** — Cualquier miembro (RESIDENT, VIEWER) crea cargos que generan DEBIT en el ledger.
16. **`/api/payments` POST no verifica rol** — Cualquier miembro registra pagos `CONFIRMED` directamente, saltándose la revisión.
17. **Múltiples APIs sin verificación de rol ADMIN**: `/api/expenses` POST, `/api/suppliers` POST, `/api/funds` POST, `/api/budget` POST, `/api/payment-references` POST, `/api/announcements` POST, `/api/team/[id]` PATCH (permite auto-degradación).
18. **`/api/bcv` POST + `/api/me` PATCH `syncBcv` no verifican rol ADMIN** — Cualquier miembro altera la tasa BCV global que afecta a TODOS los condominios.
19. **`/api/polls/[id]/vote` doble conteo de votos** — La transacción incrementa `PollOption.votes` Y crea `PollVote` (solo este último se lee). Contador desincronizado.

### E. Portal residente completamente roto (11 bugs CRÍTICOS)

20. **Portal residente inalcanzable** — Ningún componente residente está cableado en `page.tsx`. Todo el portal es código muerto.
21. **`RoleSelectorScreen` orfanado** — Ningún archivo lo importa. La elección admin/residente no existe en la UI.
22. **`ResidentJoinScreen` orfanado** — Nunca se renderiza. El flujo "Soy Residente" no existe.
23. **`useRegister` crea users con `role: "ADMIN"` y `onboardingDone: false`** — No existe registro específico para RESIDENT.
24. **`/api/residents/join` espera `body.code`, el frontend envía `body.inviteCode`** — El join siempre falla con 400.
25. **`/api/residents/join` busca `Residence.joinCode` (nunca poblado) en lugar de `Condominium.inviteCode`** — Aún con el campo correcto, devuelve 404.
26. **`useResidentMe` shape mismatch** — Tipo plano `{ name, email, outstanding, paymentCode }` vs objeto anidado `{ user, condominium, balance, pendingInvoices }` del API. Todos los bindings son `undefined`.
27. **`/api/residents/me/invoices` NO existe** — ResidentDashboard y ResidentInvoices siempre vacíos.
28. **`PATCH /api/residents/me` NO existe** — ResidentProfile no puede guardar (devuelve 405).
29. **`resident.paymentCode` no implementado en backend** — ResidentPaymentsV2 y ResidentProfile muestran "—" como código de pago. Funcionalidad núcleo faltante.
30. **"Subir comprobante" decorativo** — No hay `<input type="file">` ni endpoint de upload en ResidentPaymentsV2.

### F. Otros CRÍTICOS

31. **`/api/requests` bug de privacidad** — `residenceId: membership.residenceId ?? undefined` → si el residente no tiene vivienda, ve TODAS las solicitudes del condominio.
32. **`/api/polls/[id]/vote` TOCTOU** — Check de voto existente y create no atómicos. Race condition permite doble voto antes del constraint.
33. **`/api/team/join` no transaccional** — Si `teamInvite.update` falla después de `member.create`, la invitación se puede aceptar múltiples veces.
34. **`/api/facilities/reservations` race condition en anti-solapamiento** — Check y create no atómicos.
35. **`/api/payments` POST no idempotente** — Mismo pago registrado N veces, N asientos contables.
36. **`/api/funds` POST `balanceVES` independiente de `balanceUSD`** — Violación del principio bimonetario. No se calcula con tasa BCV.
37. **`Fund` schema sin `bcvRateId`** — Imposible auditar a qué tasa se valoró cada fondo.
38. **`/api/ledger` asientos sin `condominiumId` quedan invisibles** — `appendLedgerEntry` nunca setea `condominiumId`.
39. **`/api/auth/[...nextauth]` callback `jwt` consulta BD en cada request** — Sin caché, cada request autenticado hace round-trip a SQLite.
40. **`/api/auth/[...nextauth]` no verifica `user.active` en JWT** — Usuarios desactivados siguen con sesión válida 30 días.
41. **`payment-references-view.tsx` `VENEZUELAN_BANKS` tratado como objetos pero es array de strings** — Dropdown de bancos vacío, no se puede seleccionar banco. Bug en 2 lugares.
42. **`polls-view.tsx` botón "Nueva votación" sin onClick** — No hace absolutamente nada. La funcionalidad de crear votaciones NO está implementada.
43. **`alerts-view.tsx` endpoint PATCH inexistente** — Llama a `/api/security-alerts/[id]` PATCH pero esa ruta no existe. "Marcar resuelta" SIEMPRE falla con 404.
44. **ResidentPolls: `poll.hasVoted` vs `userVoted`** — El badge "Ya votaste" NUNCA aparece. El botón "Votar" sigue visible tras votar.
45. **ResidentDashboard: `recentPayments` TypeError** — `(payments.data ?? []).slice(0, 5)` asume array, pero el API devuelve `{ payments: [] }` (objeto) → crash.
46. **ResidentJoinScreen: sin rollback si join falla tras registro** — User queda creado en estado zombi (ADMIN sin condominio).
47. **`/api/onboarding` paso `condominium` no genera `inviteCode` inicial** — Residentes no pueden unirse hasta que el admin regenere manualmente.
48. **`/api/onboarding` paso `complete` no valida pasos anteriores** — Atajo para saltarse configuración.
49. **`/api/onboarding` paso `condominium` no transaccional** — Si `condominiumMember.create` falla, queda condominio huérfano sin admin.

---

## 🟠 P1 — BUGS ALTOS (funcionalidad importante rota, UX muy mala)

### Vistas admin (16 bugs altos)

50. **`team-view.tsx` botón Shield decorativo** — Sin `onClick`, no permite editar roles, eliminar miembros ni revocar invitaciones.
51. **`team-view.tsx` no hay forma de cancelar invitaciones pendientes** — Las invitaciones INVITED se muestran sin acción para revocar.
52. **`module-config-view.tsx` botón "Guardar" inútil** — Solo muestra toast, los switches ya guardan vía `toggle.mutate`. Misleading.
53. **`invoices-view.tsx` sin botón para generar facturas** — Existe `/api/invoices/generate` pero la vista no lo invoca.
54. **`invoices-view.tsx` totales del resumen no respetan filtros** — Calculan sobre `invoices` crudos, no sobre `filtered`.
55. **`announcements-view.tsx` read-only** — No hay botón "Nuevo aviso", "Editar", "Eliminar". El admin no puede crear avisos desde la UI.
56. **`requests-view.tsx` sin gestión de estado** — No hay botones para marcar "En proceso", "Resuelta", "Cerrada". Solo permite CREAR.
57. **`facilities-view.tsx` sin funcionalidad de reservas** — Existe `/api/facilities/reservations` pero la vista no la invoca.
58. **`calendar-view.tsx` EmptyState oculta la grilla** — Si el mes no tiene eventos, los botones de navegación desaparecen. No se puede cambiar de mes.
59. **`calendar-view.tsx` campo `type` no se puede elegir** — Siempre se envía `type: "EVENT"`. Eventos de pago/mantenimiento no se categorizan.
60. **`documents-view.tsx` botón "Ver" no funcional** — Sin `onClick` ni `<a>`. No hace nada.
61. **`documents-view.tsx` categoría como Input free-text** — Debería ser Select con las 4 opciones soportadas.
62. **`receipts-view.tsx` dropzone decorativo** — Zona "Click o arrastra" sin `onChange` ni `<input type="file">`.
63. **`access-log-view.tsx` "Exportar" solo imprime** — `window.print()` en lugar de generar CSV.
64. **`works-view.tsx` sin editar progreso ni gastos** — Después de crear, no se puede actualizar `progress`, `spent`, ni `status`.
65. **`expenses-view.tsx` imports Pencil/Trash2 no usados** — Indica que se planeó edición/eliminación pero no se implementó. No hay forma de editar ni eliminar gastos.

### APIs (20 bugs altos)

66. **`/api/payments` POST `amountUSD = NaN` no se filtra** — `round2(Number("abc"))` persiste NaN en BD.
67. **`/api/payments` POST `status` defaults a `CONFIRMED`** — El cliente controla el status; un residente puede autoconfirmar.
68. **`/api/payments` POST no actualiza `Invoice.paidAmountUSD`** — No hay cruce pago ↔ factura.
69. **`/api/payments` GET no filtra por `membership.role` para RESIDENT** — Un residente puede ver pagos de otras viviendas pasando `?residenceId=<id-ajeno>`.
70. **`/api/receipts` POST resident puede setear `body.residenceId` arbitrario** — Si `membership.residenceId` es null.
71. **`/api/receipts/[id]` PATCH permite a STAFF/VIEWER aprobar** — Solo bloquea a RESIDENT.
72. **`/api/receipts/[id]/ocr` POST pasa URL a función que espera base64** — Endpoint no funcional.
73. **`/api/payment-references` POST no verifica rol ADMIN** — Un RESIDENT podría crear referencias maliciosas que suplanten la cuenta del condominio.
74. **`/api/bank-accounts` `bankName` validation no hace nada** — Ambas ramas del ternario retornan `body.bankName`.
75. **`/api/services` `factor = r.aliquot || 1`** — Si `aliquot` es 0 (exento), evalúa a 1.
76. **`/api/invoices/generate` `r.aliquot || 1` mismo bug** — Residentes con alícuota 0 pagan igual que alícuota 1.
77. **`/api/invoices/generate` no idempotente con `body.baseFeeUSD` distinto** — Segunda vez con mismo `period` pero distinto monto no actualiza (salta todas).
78. **`/api/expenses` POST no actualiza `Fund.balanceUSD`** — Si se pasa `fundId`, el gasto no descuenta del fondo.
79. **`/api/budget` `upsert` inconsistencia null vs 0** — En `update` usa `month: 0`, en `create` usa `month: null`. Unique constraint no matchea → duplicados.
80. **`/api/ledger` GET asientos sin `residenceId` ni `condominiumId` invisibles** — `appendLedgerEntry` nunca setea `condominiumId`.
81. **`/api/messages` GET no filtra por `condominiumId`** — `Message` no tiene `condominiumId` en schema. Un usuario ve mensajes de cualquier condominio.
82. **`/api/marketplace` no hay PATCH ni DELETE** — No se puede editar ni eliminar ni marcar como VENDIDO.
83. **`/api/visitors` POST no transaccional entre `visitor.create` y `accessLogEntry.create`** — Si el log falla, visitante registrado sin entrada de auditoría.
84. **`/api/visitors/[id]` PATCH no verifica rol** — Cualquier miembro puede autorizar/denegar/check-in/check-out.
85. **`/api/security-alerts` no hay PATCH ni DELETE** — No se pueden resolver/cerrar alertas.

### Portal residente (8 bugs altos)

86. **ResidentSidebar botón "Cerrar sesión" sin onClick** — Botón decorativo, el logout real solo está en Profile.
87. **ResidentDashboard conversión VES hardcoded `* 621`** — Ignora tasa BCV real.
88. **ResidentPaymentsV2 `bankLabel` siempre retorna código crudo** — `VENEZUELAN_BANKS` es array de strings, no objetos.
89. **ResidentPaymentsV2 conversión VES hardcoded `* 621`**.
90. **ResidentInvoices conversión VES hardcoded `* 621`**.
91. **ResidentAnnouncements `a.type` no existe** — El API devuelve `category`. Badge siempre muestra "info" en verde.
92. **ResidentProfile `initialPhone` siempre `""`** — El API no devuelve `phone` en el nivel raíz.
93. **ResidentProfile `resident.email`, `condominiumName`, `residenceLabel`, `id` siempre undefined** — Shape mismatch.

### Auth / Onboarding (3 bugs altos)

94. **`/api/me` PATCH sin validación de body** — Un cliente puede pasar `onboardingStep: 999`, `onboardingDone: true` y saltarse el wizard.
95. **`/api/me` PATCH `syncBcv: true` accesible a cualquier usuario** — Cualquier miembro puede alterar la tasa BCV global.
96. **`/api/bcv` GET no requiere autenticación** — Expone la tasa BCV a cualquier visitante.

### Otros (4 bugs altos)

97. **Ausencia universal de estados de error** — ~20 vistas con `useQuery` solo manejan `isLoading`. Si la API falla, skeleton infinito.
98. **`initials(name)` frágil en 3 vistas** — `name.split(" ").map((s) => s[0])` produce "JUNDEFINED" si hay espacios dobles.
99. **Vistas admin sin verificación de rol frontend** — team, invite-code, module-config, payment-references: cualquier rol ve los botones.
100. **CRUD incompletos en muchas vistas** — Solo Create + Read en polls, announcements, requests, facilities, works, vehicles, marketplace, documents, messages.
101. **`/api/team/[id]` PATCH permite al admin degradarse a sí mismo** — Sin verificar `target.userId === user.id`. Lock-out posible.
102. **`/api/billing-config` flag `autoGenerate` guardado pero nada lo ejecuta** — Las facturas deben generarse manualmente.
103. **`/api/reports/export` CSV injection** — `csvEscape` no escapa fórmulas (`=`, `+`, `-`, `@`).
104. **`/api/reports/export` permite STAFF/VIEWER** — Debería ser ADMIN-only.
105. **`/api/dashboard` trae TODOS los `ledgerEntries` en memoria** — Para 100 viviendas × 100 asientos = 10,000 registros por request.
106. **`/api/residents/me/payments` POST no crea Receipt vinculado** — El residente registra pago sin comprobante.
107. **`/api/residents/me/payments` POST no idempotente** — Mismo pago registrado N veces.
108. **`/api/residents/me/payments` POST no dispara notificación al admin** — El admin no se entera de pagos pendientes.
109. **`/api/residents/me/payments` POST no valida `reference` para métodos que la requieren**.
110. **`/api/auth/register` no envía email de verificación ni marca `emailVerified`**.
111. **`/api/polls/[id]/vote` no respeta `multipleChoice: true`** — La opción multi-choice no funciona.
112. **`/api/polls/[id]/vote` `residenceId` puede ser null si `membership.residenceId` es null** — Admin sin vivienda vota con weight=1.
113. **`/api/team` tokens en URL query string** — Se logean en access logs, proxies, history.
114. **`/api/team` no expira invitaciones** — `TeamInvite` sin `expiresAt`.
115. **`/api/team/[id]` DELETE hard delete** — Pierde historial de roles.
116. **`/api/visitors/[id]` PATCH no transaccional entre `visitor.update` y `accessLogEntry.create`**.
117. **`/api/works` `spentUSD` seteado manualmente** — Debería cruzarse con `Expense` vinculados.
118. **`/api/facilities/reservations` POST `residenceId` puede ser null** — Schema no permite null → constraint violation.
119. **`/api/facilities/reservations` POST no verifica horario dentro de `openHour`/`closeHour`**.
120. **`/api/funds` POST no valida `type` contra enum**.
121. **`/api/funds` no hay PATCH ni DELETE** — No se pueden editar ni cerrar fondos.
122. **`/api/messages` POST no valida longitud del `body`** — Permite mensajes vacíos o arbitrariamente largos.
123. **`/api/documents` POST `visible: body.visible !== false` default true** — Documentos administrativos visibles a todos por defecto.
124. **`/api/directory` POST permite STAFF/VIEWER** — Debería ser ADMIN-only.
125. **`/api/announcements` POST permite `pinned: true` desde el cliente** — Un residente podría pinear su propio aviso.
126. **`/api/requests/[id]` PATCH residente puede cambiar `status` y `priority` de sus propias solicitudes** — Auto-marcar como RESOLVED.
127. **`/api/team` no envía email real** — Solo crea notificación in-app si el usuario existe.
128. **`/api/auth/[...nextauth]` callback `jwt` no cachea** — Round-trip a SQLite en cada request.
129. **`/api/announcements` no hay PATCH ni DELETE** — Los avisos no se pueden editar ni eliminar.
130. **`/api/suppliers` no hay PATCH ni DELETE** — No se pueden editar ni desactivar proveedores.
131. **`/api/facilities` no hay PATCH ni DELETE** — No se pueden editar ni desactivar instalaciones.
132. **`/api/calendar` no hay PATCH ni DELETE** — No se pueden editar ni eliminar eventos.
133. **`/api/vehicles` no hay PATCH ni DELETE** — No se pueden editar ni desactivar vehículos.
134. **`/api/vehicles` GET solo retorna `active: true`** — No hay forma de ver vehículos inactivos.
135. **`/api/residents/me/payments` GET no filtra por `status`** — Devuelve todos los pagos mezclados.
136. **`/api/morosos` `monthsLate` usa `condominium.baseFeeUSD || 1`** — Si `baseFeeUSD` es 0, divide por 1 → número absurdo de meses.
137. **`/api/team/join` no actualiza `User.role`** — Inconsistencia entre `User.role` y `membership.role`.
138. **`/api/residents/link` no notifica al usuario vinculado**.
139. **`/api/ledger` falta endpoint `/api/ledger/verify`** — La función `verifyLedgerIntegrity` existe pero no se expone.
140. **`/api/receipts/[id]` PATCH no idempotente** — Aprobar un comprobante ya aprobado no devuelve 409.

---

## 🟡 P2 — BUGS MEDIOS (UX mejorable, validaciones faltantes,性能)

### Validaciones de input faltantes (30+ bugs)
141-170. **Falta validación Zod en TODOS los POST/PATCH** — No se validan tipos, enums, rangos, formatos. Se confía en el cliente.
- `aliquot` acepta 0 o negativos
- `type`, `severity`, `status`, `priority`, `category` no validados contra enum
- `phone`, `email`, `rif`, `plate`, `accountNumber`, `documentId` no validados con regex
- `dueDate`, `closesAt`, `startDate < endDate` no validados
- `manualRate` sin límite superior
- `lateFeePercent` sin rango 0-100
- `progress` sin rango 0-100
- `price` acepta negativos
- `year` acepta negativos o futuros lejanos
- `capacity` acepta 0 o negativa
- `openHour`/`closeHour` no validados
- `amountUSD` acepta NaN

### Sin verificación de módulo activo (12 bugs)
171-182. **Las APIs de módulos no verifican `moduleConfig.enabled`** — `polls`, `announcements`, `requests`, `facilities`, `calendar`, `messages`, `marketplace`, `documents`, `works`, `directory`, `security` (visitors, vehicles, alerts, access-log). Solo el sidebar filtra; los datos siguen siendo accesibles/creables vía API.

### Sin paginación (5 bugs)
183-187. **`/api/ledger` (limit 200), `/api/access-log`, `/api/documents` (take 200), `/api/notifications` (take 100), `/api/reports/export` (take 1000)** — Sin paginación ni cursor. Reportes grandes se truncan.

### Notificaciones faltantes (8 bugs)
188-195. **Múltiples flujos no disparan notificaciones**:
- Pago confirmado → residente no notificado
- Comprobante subido → admin no notificado
- Comprobante aprobado/rechazado → residente no notificado
- Votación creada → residentes no notificados
- Factura generada → residentes no notificados
- Solicitud cambia estado → residente no notificado
- Mensaje nuevo → destinatario no notificado
- Reserva pendiente → admin no notificado

### Performance (5 bugs)
196-200. **`/api/dashboard` trae todos los ledgerEntries en memoria** — Debería usar agregación SQL.
- `/api/morosos` calcula saldos en JS trayendo todos los ledgerEntries
- `/api/bcv/history` bug lógico en paginación (`take` + `slice(-days)` redundante)
- `/api/polls` calcula `totalVotes` y `totalWeight` en JS en vez de BD
- `/api/auth/[...nextauth]` callback `jwt` consulta BD en cada request

### Otros medianos
201. **`settings-view.tsx` versión hardcodeada "1.0.0"**
202. **`payments-view.tsx` conversión bimonetaria falla silenciosamente si rate=0**
203. **`payments-view.tsx` validación de fecha ausente** — Permite fechas futuras
204. **`funds-view.tsx` `balanceVES` enviado como 0 si rate=0** — Se guarda 0 en BD para siempre
205. **`budget-view.tsx` no se puede editar ni eliminar presupuestos**
206. **`funds-view.tsx` no hay movimientos de fondo** — El balance se setea al crear pero no hay `FundMovement`
207. **`services-view.tsx` no se puede editar un cargo después de creado**
208. **`services-view.tsx` `markPaid` no verifica que el cargo tenga pago registrado**
209. **`services-view.tsx` `cancel` no pide confirmación**
210. **`marketplace-view.tsx` `imageUrl` no se puede subir desde el form**
211. **`documents-view.tsx` sin subida real de archivos** — Solo se captura URL
212. **`vehicles-view.tsx` `type` hardcoded a "RESIDENT"** — No se pueden registrar vehículos de visitantes
213. **`vehicles-view.tsx` placa no validada con regex VE**
214. **`visitors-view.tsx` sin botón "Marcar entrada"** — Flujo de check-in incompleto
215. **`works-view.tsx` opción CANCELLED falta en Select**
216. **`directory-view.tsx` vista read-only** — No se puede editar ni eliminar
217. **`requests-view.tsx` campo `priority` declarado pero nunca usado**
218. **`requests-view.tsx` sin filtro por estado**
219. **`messages-view.tsx` sin gestión de mensajes** — No responder, reenviar, marcar leído, eliminar
220. **`messages-view.tsx` form no valida `recipient`**
221. **`invite-code-view.tsx` sin confirmación al regenerar**
222. **`module-config-view.tsx` `toggle.isPending` bloquea TODOS los switches**
223. **`module-config-view.tsx` módulos "Premium" sin restricción**
224. **`/api/team/join` no verifica que el usuario haya completado su onboarding**
225. **`/api/visitors/[id]` PATCH no valida transiciones de estado**
226. **`/api/visitors/[id]` PATCH `checkInAt` no se actualiza en reentrada**
227. **`/api/notifications` PATCH con `ids: undefined` marca TODAS como leídas**
228. **`/api/notifications/[id]` DELETE es hard delete**
229. **`/api/team` `inviteUrl` sugiere GET pero `/api/team/join` solo acepta POST**
230. **`/api/team/[id]` DELETE no transfiere ownership**
231. **`/api/modules` desactivar módulo no propaga** — Las APIs correspondientes siguen funcionando
232. **`/api/billing-config` GET auto-crea config si no existe** — Side-effect en GET
233. **`/api/reports/export` sin filtro por rango de fechas**
234. **`/api/residents` no pagina**
235. **`/api/residents/me` trae `ledgerEntries` sin paginar**
236. **`/api/polls` POST no valida `closesAt` sea futura**
237. **`/api/polls` POST no valida que `options` no tengan duplicados**
238. **`/api/announcements` GET no filtra por `publishedAt <= now`**
239. **`/api/requests` POST permite a RESIDENT setear `priority`**
240. **`/api/requests/[id]` PATCH no valida transición de estados**
241. **`/api/facilities` POST no valida `capacity > 0`**
242. **`/api/calendar` GET no filtra eventos pasados automáticamente**
243. **`/api/messages` no marca mensajes como leídos automáticamente**
244. **`/api/messages` GET retorna `messages` + `contacts` en la misma respuesta** — Acoplamiento
245. **`/api/marketplace` POST permite a cualquier miembro publicar** — No filtra spam
246. **`/api/marketplace` no expira anuncios automáticamente**
247. **`/api/documents` no valida `fileType` ni `fileSize`**
248. **`/api/works` no hay PATCH ni DELETE**
249. **`/api/directory` no hay PATCH ni DELETE**
250. **`/api/directory` GET expone `phone`, `email` a cualquier miembro**
251. **`/api/visitors` no valida formato de `phone`, `plate`, `documentId`**
252. **`/api/security-alerts` POST no valida `severity` contra enum**
253. **`/api/access-log` sin filtro por fecha**
254. **`/api/access-log` no exporta a CSV**
255. **`/api/condominium/invite` `generateCode` usa `% chars.length`** — Sesgo modular
256. **`/api/condominium/invite` GET accesible a cualquier miembro** — Residente ve el `inviteCode`
257. **`/api/onboarding` paso `bcv` no verifica membership**
258. **`/api/onboarding` paso `residences` silencia errores con `catch {}`**
259. **`/api/onboarding` paso `condominium` no valida unicidad de RIF**
260. **`/api/bcv` POST no transaccional entre `fetchBcvRate` y `saveBcvRate`**
261. **`/api/bcv` POST acepta `manualRate` sin validación de rango**
262. **`/api/bcv/history` no requiere autenticación**
263. **`/api/bcv/history` no filtra por condominio**
264. **`/api/condominium` GET expone `adminPhone`, `adminEmail` a cualquier miembro**
265. **`/api/residences` GET expone `ownerEmail`, `ownerPhone`, `residentPhone` a cualquier miembro**
266. **`/api/residences` POST no valida `type` contra enum**
267. **`/api/payments` POST `fundId` y `destinationAccountId` no se validan contra condominio**
268. **`/api/receipts` POST no valida tamaño/tipo del `body.data` (base64)** — Ataque DoS
269. **`/api/receipts` GET retorna 200 sin wrapper `total`/`pagination`**
270. **`/api/receipts/[id]` GET expone `ocrRaw`**
271. **`/api/payment-references/[id]` DELETE no audita quién borró**
272. **`/api/bank-accounts` no valida `accountType` ni `currency` contra enums**
273. **`/api/bank-accounts` GET expone `accountNumber`, `phonePagoMovil`, `cedulaPagoMovil` a cualquier miembro**
274. **`/api/bank-accounts` no hay PATCH ni DELETE**
275. **`/api/services` POST permite `status: "PAID"` desde el cliente**
276. **`/api/services` POST no valida `dueDate`**
277. **`/api/invoices` GET no filtra por período**
278. **`/api/invoices` GET no verifica rol para RESIDENT**
279. **`/api/invoices` no hay POST/PATCH/DELETE**
280. **`/api/expenses` POST no valida `fundId` ni `supplierId` ni `residenceId` contra condominio**
281. **`/api/expenses` POST permite `status: "CONFIRMED"` desde el cliente**
282. **`/api/suppliers` no valida formato de `rif`, `email`, `phone`**
283. **`/api/suppliers` GET no filtra `active`**
284. **`/api/budget` no valida `year`**
285. **`/api/budget` no valida `category` contra enum**
286. **`/api/funds` POST no valida `type` contra enum**
287. **`/api/ledger` GET no verifica rol para RESIDENT**
288. **`/api/polls` POST no dispara notificación a residentes**
289. **`/api/polls` `userVoted` no considera votos ponderados por vivienda**
290. **`/api/announcements` POST no verifica módulo activo**
291. **`/api/announcements` GET no filtra por `publishedAt <= now`**
292. **`/api/requests` POST permite a RESIDENT setear `category`**
293. **`/api/requests` no asigna `assignedToId` ni workflow**
294. **`/api/facilities` POST no verifica módulo activo**
295. **`/api/calendar` POST no valida `startDate < endDate`**
296. **`/api/calendar` GET no valida `from` es fecha válida**
297. **`/api/messages` no verifica módulo activo**
298. **`/api/marketplace` POST no valida `currency` contra enum**
299. **`/api/marketplace` no verifica módulo activo**
300. **`/api/documents` POST no valida que `fileUrl` apunte a un recurso real**
301. **`/api/documents` no verifica módulo activo**
302. **`/api/works` POST no valida `progress` en rango 0-100**
303. **`/api/works` no verifica módulo activo**
304. **`/api/works` `budgetUSD` no crea asiento contable ni afecta fondo**
305. **`/api/directory` POST no valida `role` contra enum**
306. **`/api/directory` no verifica módulo activo**
307. **`/api/visitors` POST no verifica módulo activo**
308. **`/api/visitors` POST no valida formato de `phone`, `plate`, `documentId`**
309. **`/api/vehicles` POST no valida formato de `plate`**
310. **`/api/vehicles` no verifica módulo activo**
311. **`/api/security-alerts` POST no verifica módulo activo**
312. **`/api/security-alerts` `createNotificationForMembers` notifica a TODOS los miembros** — Ruido
313. **`/api/access-log` GET no hay filtro por fecha**
314. **`/api/access-log` no exporta a CSV**
315. **`/api/notifications` no hay paginación**
316. **`/api/team` GET no expira invitaciones**
317. **`/api/team` no hay cancelar invitación**
318. **`/api/modules` default true si no hay config**
319. **`/api/modules/[key]` duplica funcionalidad con POST `/api/modules`**
320. **`/api/billing-config` no valida `lateFeePercent` contra rango**
321. **`/api/billing-config` permite 28 en meses de 31 días** (clamp OK)
322. **`/api/reports/export` `take: 1000` hard-coded**
323. **`/api/residents` no pagina**
324. **`/api/residents/me` trae `ledgerEntries` sin paginar**
325. **`/api/residents/me/payments` POST no valida `reference` para métodos que la requieren**
326. **`/api/residents/join` no valida que el usuario tenga email verificado**
327. **`/api/residents/join` no previene que un usuario se una a múltiples condominios**
328. **`/api/residents/link` permite vincular a viviendas inactivas**

---

## 🟢 P3 — BUGS BAJOS (cosméticos, code debt, optimizaciones menores)

329-377. **Aproximadamente 49 bugs bajos** incluyendo:
- Iconos semánticamente incorrectos (invite-code usa `Home` para "Expira")
- Headers de días ambiguos (`["D", "L", "M", "M", "J", "V", "S"]`)
- `outstandingByType.credit` no muestra VES
- CSV exportado sin dato de banco
- Variable `monthlyBar.usd` calculada pero no usada
- `m.outstanding.toFixed(2)` no localizado (debería usar `formatUSD`)
- Endpoint `/api` raíz "Hello, world!" de ejemplo (debería eliminarse)
- `/api/payment-references/me` duplicado funcional con `/api/payment-references` GET
- Función `initials` frágil repetida en 3 vistas
- `RoleSelectorScreen` Card con `onClick` + `Button` = doble trigger
- `RoleSelectorScreen` cards no accesibles por keyboard
- `resident-store` no persiste vista activa entre sesiones
- Doble `signIn` redundante en ResidentJoinScreen
- `onAuthed()` se llama sin esperar al refresh
- Y más...

---

## 📋 RESUMEN EJECUTIVO

| Categoría | CRÍTICOS | ALTOS | MEDIOS | BAJOS | Total |
|---|---|---|---|---|---|
| **Seguridad / Auth** | 5 | 3 | 8 | 2 | 18 |
| **Funcionalidad núcleo rota** | 5 | 0 | 0 | 0 | 5 |
| **Integridad hash chain** | 4 | 0 | 0 | 0 | 4 |
| **Autorización / Permisos** | 5 | 20 | 12 | 0 | 37 |
| **Portal residente** | 11 | 8 | 5 | 5 | 29 |
| **Vistas admin** | 3 | 16 | 20 | 18 | 57 |
| **APIs REST** | 9 | 20 | 50 | 15 | 94 |
| **Notificaciones** | 0 | 0 | 8 | 0 | 8 |
| **Validaciones** | 0 | 0 | 30 | 0 | 30 |
| **Performance** | 0 | 1 | 5 | 0 | 6 |
| **CRUD incompletos** | 0 | 0 | 15 | 0 | 15 |
| **Otros** | 7 | 3 | 4 | 9 | 23 |
| **TOTAL** | **49** | **71** | **157** | **49** | **326** |

---

## 🎯 ORDEN DE EJECUCIÓN RECOMENDADO PARA FASE 12

### Sprint 1: Seguridad crítica (P0-A, P0-D) — 10 bugs
1. Agregar `getUserContext()` + check ADMIN a `/api/residences/[id]`, `/api/services/[id]`, y todas las APIs POST/PATCH administrativas
2. Cambiar `User.role` default a `USER` en registro y OAuth
3. Rate limiting en `/api/auth/register`, `/api/bcv`, `/api/payments`

### Sprint 2: Funcionalidad núcleo (P0-B, P0-C) — 9 bugs
4. Envolver `payment.create + appendLedgerEntry` en `db.$transaction` y refactorizar `ledger.ts` para aceptar `tx`
5. Generar `joinCode` automático al crear `Residence`
6. Implementar cruce `Payment ↔ Invoice` (actualizar `paidAmountUSD` y `status`)
7. Crear `Payment + ledger entry` al aprobar `Receipt`
8. Crear `ledger entry DEBIT` al generar facturas y crear gastos
9. Hacer `late-fees` idempotente

### Sprint 3: Portal residente (P0-E) — 11 bugs
10. Cablear portal residente en `page.tsx` con renderizado condicional según `membershipRole`
11. Unificar shape de `/api/residents/me` con el tipo `ResidentMe`
12. Crear `/api/residents/me/invoices` GET y `PATCH /api/residents/me`
13. Implementar `paymentCode`
14. Reconciliar `Condominium.inviteCode` ↔ `Residence.joinCode`
15. Fix `body.inviteCode` → `body.code` en ResidentJoinScreen
16. Implementar upload real de comprobante
17. Fix `poll.hasVoted` → `poll.userVoted`
18. Reemplazar `* 621` hardcoded con `useBcvRate()`
19. Fix `bankLabel`, `a.type` → `a.category`
20. Fix privacidad en `/api/requests`

### Sprint 4: Bugs altos restantes (P1) — 71 bugs
21. Componente `ErrorState` compartido y aplicarlo a todas las vistas
22. Agregar PATCH/DELETE faltantes en suppliers, facilities, works, documents, directory, marketplace, calendar, announcements, security-alerts
23. Implementar creación de avisos, votaciones, gestión de requests, check-in de visitantes, reservas de facilities
24. Fix `calendar-view` EmptyState, `documents-view` botón Ver, `invoices-view` totales filtrados
25. Cablear `RoleSelectorScreen` y `ResidentJoinScreen`
26. Implementar notificaciones en todos los flujos

### Sprint 5: Bugs medios (P2) — 157 bugs
27. Validación Zod en TODOS los POST/PATCH
28. Verificación de `moduleConfig.enabled` en APIs de módulos
29. Paginación en ledger, access-log, documents, notifications, reports
30. Performance: agregación SQL en dashboard/morosos, caché BCV
31. CRUD completos: editar/eliminar en todas las vistas
32. Fix todos los bugs de UX medianos

### Sprint 6: Bugs bajos (P3) — 49 bugs
33. Code cleanup, iconos, accesibilidad, localización

---

**Total estimado: 326 bugs a corregir en Fase 12.**
