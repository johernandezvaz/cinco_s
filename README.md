# Auditoría 5S de Estaciones

Aplicación para capturar y revisar auditorías 5S en una planta de manufactura.

**Stack:** Next.js 16 (App Router, TypeScript estricto) · PostgreSQL 16+ · Drizzle ORM con el driver `postgres` (postgres.js) · Zod · Vitest.

## Inicio rápido

Requisitos: Node 20.12+, pnpm y Docker (o cualquier PostgreSQL accesible).

```bash
pnpm install
cp .env.example .env.local
docker compose up -d
pnpm db:migrate
pnpm dev
```

Abre `http://localhost:4571`. La base arranca vacía; el tablero muestra sus estados vacíos hasta que se envíe el primer check-list.

`docker compose up -d` levanta `postgres:16` en el puerto 5432 con un volumen persistente (`pgdata`). Crea la base `auditoria5s` y la base de pruebas `auditoria5s_test` (esta última solo la primera vez que se crea el volumen). Para usar otro PostgreSQL basta con cambiar `DATABASE_URL`.

## Variables de entorno (`.env.local`)

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Base de trabajo, p. ej. `postgres://postgres:postgres@localhost:5432/auditoria5s`. |
| `DATABASE_URL_TEST` | Base separada para las pruebas de integración. Se vacía en cada prueba; nunca debe ser la misma que `DATABASE_URL`. |
| `APP_TIME_ZONE` | Zona horaria de los filtros y fechas del tablero. Por defecto `America/Mexico_City`. |

## Scripts

- `pnpm dev`: servidor de desarrollo (puerto 4571).
- `pnpm build` y `pnpm start`: compilación y ejecución de producción.
- `pnpm db:generate`: genera una migración en `drizzle/` a partir de `src/db/schema.ts`.
- `pnpm db:migrate`: aplica las migraciones pendientes a `DATABASE_URL`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`: controles de calidad. Las pruebas de integración corren contra `DATABASE_URL_TEST` y se omiten si no está definida.

## Sistema de puntos

| Respuesta | Significado | Puntos |
|---|---|---|
| Sí | se cumple | 2 |
| Parcial | se cumple a medias | 1 |
| No | no se cumple | 0 |

- 15 preguntas → máximo 30 puntos por evaluación; 3 preguntas por S → máximo 6 por S.
- Porcentaje = puntos / 30 × 100, redondeado a entero. Porcentaje por S = puntos de la S / 6 × 100.
- Las respuestas se guardan como `si` / `parcial` / `no`. `score` (0–30) y `percentage` (0–100) se calculan **siempre en el servidor** al guardar; nunca se toman del cliente.
- Valores y umbrales: `src/config/scoring.ts`. Cálculo: `src/lib/scoring.ts` (funciones puras con pruebas).

**Dónde se muestran los puntos:** solo en la leyenda del formulario. Botones, encabezados de sección, confirmación, tablero, detalle, tablas y CSV muestran porcentaje y semáforo.

### Semáforo

| Estado | Rango |
|---|---|
| ✓ Cumple | ≥ 85% |
| ◐ Mejorar | 70–84% |
| ✕ Crítico | < 70% |

## Tablero

- Filtros Hoy / Últimos 7 días / 30 días / Todo, con días calculados en `APP_TIME_ZONE`. "Últimos 7 días" va de las 00:00 de hace 6 días hasta ahora.
- El semáforo por estación, los KPI de estaciones (evaluadas, cumplen, a mejorar, críticas) y el promedio por S usan la última evaluación de cada estación dentro del periodo.
- El promedio general y los puntos que más fallan usan todas las evaluaciones del periodo.
- Al tocar una estación se abre el detalle de esa evaluación con su respuesta a cada pregunta.
- "Exportar CSV" descarga las evaluaciones del periodo con fecha, estación, operador, turno, porcentaje, semáforo, comentarios y las 15 respuestas (Sí/Parcial/No).

## Estructura

- `src/config/checklist.ts`: preguntas por S, editables sin tocar componentes.
- `src/config/scoring.ts`: puntos, umbrales, turnos y zona horaria.
- `src/db/schema.ts` y `drizzle/`: esquema y migraciones de PostgreSQL.
- `src/db/audits.ts`: guardado transaccional (evaluación + 15 respuestas, validado con Zod) y consultas del tablero, detalle y CSV.

## Diseño

La fuente de verdad visual es `design/DESIGN.md`.
