# Auditoría 5S de Estaciones

Aplicación para capturar y revisar auditorías 5S en una planta de manufactura.

**Stack:** Next.js 16 (App Router, TypeScript estricto) · PostgreSQL 16+ · Drizzle ORM con el driver `postgres` (postgres.js) · Zod · Vitest · exceljs (Excel) · @react-pdf/renderer (PDF).

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
- Los filtros usan las claves `today`, `7d`, `30d` y `all` (los enlaces anteriores con `7` y `30` siguen funcionando).
- El botón **Exportar** descarga el periodo seleccionado en CSV, Excel o PDF (ver abajo).

## Exportar

`GET /api/export?format=csv|xlsx|pdf&period=today|7d|30d|all` (por defecto `period=7d`). Parámetros validados con Zod: valores inválidos devuelven **400**. Responde con `Content-Disposition: attachment`, `Cache-Control: no-store` y el nombre `auditoria-5s_{periodo}_{YYYY-MM-DD}.{ext}` (fecha de generación en `APP_TIME_ZONE`). Funciona sin red: no usa CDN ni fuentes remotas.

Las tres salidas y el tablero leen la misma función, `getDashboardData(period, timeZone)` en `src/lib/dashboard-data.ts`; porcentajes y semáforo vienen de `src/lib/scoring.ts`.

| Formato | Contenido |
|---|---|
| **CSV** | Todos los registros del periodo. UTF-8 con BOM, coma, CRLF. Columnas: Fecha (`YYYY-MM-DD HH:mm` local), Estación, Operador, Turno, Porcentaje, Semáforo, Comentarios y las 15 respuestas (encabezado `1S-1 Solo lo necesario`, valores Sí/Parcial/No). Celdas que empiezan con `=`, `+`, `-`, `@`, tab o retorno se prefijan con `'`. |
| **Excel** | Hojas: Resumen (periodo, fecha de generación, 5 KPI, leyenda del semáforo), Semáforo por estación, Puntos que más fallan, Promedio por S y Registros (todos, con las 15 respuestas). Encabezados navy, primera fila congelada, autofiltro en Semáforo y Registros, porcentajes y fechas como valores reales de Excel. |
| **PDF** | Reporte A4 con los bloques del tablero: KPI, leyenda, semáforo por estación, promedio por S, puntos que más fallan y registros recientes (máximo 200; el resto está en Excel/CSV). Encabezado de tabla repetido en cada página y "Página X de Y". |

Ningún formato incluye columnas de puntos; la única mención está en la nota de metodología del PDF.

## Estructura

- `src/config/checklist.ts`: preguntas por S, editables sin tocar componentes.
- `src/config/scoring.ts`: puntos, umbrales, turnos y zona horaria.
- `src/db/schema.ts` y `drizzle/`: esquema y migraciones de PostgreSQL.
- `src/config/tokens.ts`: tokens de color (fuente única para CSS, Tailwind, Excel y PDF).
- `src/db/audits.ts`: guardado transaccional (evaluación + 15 respuestas, validado con Zod) y detalle de una evaluación.
- `src/lib/dashboard-data.ts`: datos del tablero y de las exportaciones.
- `src/lib/export/`: `csv.ts`, `xlsx.ts`, `pdf/` (componentes del reporte), `theme.ts` (tema compartido) e `index.ts` (formato, nombre de archivo).
- `src/assets/fonts/`: Inter y Barlow Condensed en TTF estático para el PDF (licencia SIL OFL 1.1 incluida).

## Diseño

La fuente de verdad visual es `design/DESIGN.md`.
