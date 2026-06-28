# Task: REBUILD-VIEWS — Recrear vistas perdidas Fase 4-10

## Work Log
- Leí worklog.md y verifiqué estructura existente del proyecto (Next.js 16 + Prisma + shadcn/ui + Tailwind 4, paleta emerald/amber)
- Confirmé que use-auth.ts ya existe con todos los hooks solicitados (useMe, useRegister, useLogin, useLogout, useOnboardingStep, useCompleteOnboarding)
- Creé 14 directorios de componentes (polls, announcements, requests, facilities, calendar, messages, marketplace, documents, works, directory, security, resident, admin, payments)
- Implementé 25 vistas client-side con shadcn/ui, useQuery/useMutation directos, fetch en queryFn, estados loading (Skeleton) + empty (EmptyState con icono)
- Implementé hook use-resident.ts con useResidentMe (GET /api/residents/me) + useLogout
- Implementé store resident-store.ts con zustand (ResidentView type + sidebarOpen)
- Implementé RoleSelectorScreen (selector admin vs residente)
- Implementé ResidentJoinScreen (código de invitación + vivienda + registro de cuenta)
- Lint inicial: 4 errores en resident-sidebar.tsx (componentes NavList/UserCard definidos dentro de render) y resident-profile.tsx (setState en effect) → refactoricé ambos
  - Sidebar: extraje NavList, UserCard y BrandHeader como componentes top-level que reciben props
  - Profile: extraje ProfileForm como componente hijo con `key={resident.id}` para remontar y usar useState lazy initializer
- Lint final: 0 errores, 0 warnings

## Stage Summary
- 25 vistas recreadas + 1 hook + 1 store + 2 pantallas auth, todas lint-clean
- Cada vista usa patrones consistentes: PageHeader + EmptyState + Skeleton loading + Dialog para crear/editar
- Paleta respetada: emerald primario, amber acento, NO indigo/blue
- Iconos lucide-react, toast de sonner, cn de @/lib/utils
- APIs llamadas con fetch directo en queryFn (no hooks externos), useQuery/useMutation de @tanstack/react-query
- Listo para integrar en page.tsx o router principal
