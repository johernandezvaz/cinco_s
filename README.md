# Auditoría 5S de Estaciones

Aplicación local para capturar y revisar auditorías 5S en una planta de manufactura. Se basa en Next.js, TypeScript estricto, PostgreSQL y Drizzle ORM.

## Inicio rápido

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Abre `http://localhost:3000`. Para cargar 30 registros de demostración usa `pnpm db:seed`.

## Scripts

- `pnpm dev`: servidor de desarrollo.
- `pnpm build` y `pnpm start`: compilación y ejecución de producción.
- `pnpm db:migrate`: aplica las migraciones de Drizzle.
- `pnpm db:seed`: crea registros ficticios para el dashboard.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`: controles de calidad.

Configura `DATABASE_URL` en `.env.local` antes de ejecutar las migraciones. Las preguntas viven en `src/config/checklist.ts` para que el equipo pueda actualizarlas sin tocar componentes.

## Diseño

La fuente de verdad es `design/DESIGN.md`. El sistema visual usa azul industrial, navy, superficies grises planas y controles compactos de radio reducido.
