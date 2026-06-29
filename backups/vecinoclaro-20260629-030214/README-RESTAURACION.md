# Backup VecinoClaro — 2026-06-29

## Cómo restaurar este backup

### 1. Base de datos (SQLite)
```bash
cp custom.db /home/z/my-project/db/custom.db
```

### 2. Schema Prisma
```bash
cp schema.prisma /home/z/my-project/prisma/schema.prisma
cd /home/z/my-project && bun run db:push
```

### 3. Variables de entorno
```bash
cp .env /home/z/my-project/.env
```

### 4. Código fuente
```bash
cp -r src/* /home/z/my-project/src/
```

### 5. Configuración
```bash
cp package.json /home/z/my-project/package.json
cp next.config.ts /home/z/my-project/next.config.ts
cp tailwind.config.ts /home/z/my-project/tailwind.config.ts
cp tsconfig.json /home/z/my-project/tsconfig.json
cd /home/z/my-project && bun install
```

### 6. Regenerar Prisma Client
```bash
cd /home/z/my-project && bun x prisma generate
```

### 7. Reiniciar dev server
```bash
cd /home/z/my-project
pkill -9 -f "next"
sleep 2
(setsid bun next dev -p 3000 > dev.log 2>&1 &)
```

## Estado del proyecto en este backup
- Versión: v4.8.3
- 43 modelos Prisma
- 63 APIs REST
- 30+ vistas admin + portal residente (inalcanzable, pendiente Fase 12)
- Membresía implementada ($2/apto/mes)
- Login + logout funcionando
- Landing page completa con 4 secciones + navbar con Membresía
- 326 bugs detectados (49 críticos) documentados en FASE-12-BACKLOG.md
- Documento PDF de contexto para The Agency incluido

## Usuarios en la base de datos
- admin2@testcondo.ve (ADMIN)
- admin3@testcondo.ve (ADMIN)
- juancito8338382ridi@gmail.com (ADMIN) — contraseña: 123456

## Condominios
- Residencias El Sol
- Residencias Guaranito (Barquisimeto)
