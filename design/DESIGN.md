---
version: 2.1
name: 5S Industrial Audit
description: Sistema visual sobrio para auditorías operativas de manufactura. Azul/navy sobre superficie gris clara, formas rectas, tipografía condensada para títulos y cifras. Prioriza contraste, legibilidad en tablet y controles táctiles claros.
---

# Diseño de Auditoría 5S

> Fuente de verdad del código: `src/config/tokens.ts`. De ahí salen el `:root` (inyectado en `src/app/layout.tsx`), los colores de `tailwind.config.ts` (`var(--blue)`, …) y el tema de exportación (`src/lib/export/theme.ts`). `globals.css` y los componentes no contienen hex; `src/config/tokens.test.ts` falla si se desincronizan.

## Color

| Token | Valor | Uso |
|---|---|---|
| `blue` | `#1d559a` | Acción primaria, acentos, enlaces, foco, relleno de barras, números 1S–5S, respuesta "Sí" |
| `blue-press` | `#174682` | Hover/activo de `blue` |
| `navy` | `#0e254e` | Títulos, texto fuerte, marca, barra de envío |
| `gray` | `#dfe1e7` | Bordes y líneas (1px) |
| `surface` | `#f3f4f7` | Fondo de página y de la franja de envío. Plano, sin degradado |
| `tint` | `#e8eef7` | Filtro activo, pista de barras vacías, hover de controles |
| `ink` | `#0e254e` | Texto principal (= navy) |
| `muted` | `#5b6578` | Texto secundario, etiquetas, encabezados de tabla, subtítulo de marca |
| `white` | `#ffffff` | Tarjetas, paneles, inputs |

### Semáforo

| Estado | Fuerte | Fondo | Texto sobre fondo | Uso |
|---|---|---|---|---|
| Cumple (≥ 85%) ✓ | `success` `#1e7a4c` | `success-bg` `#dcefe4` | `success-ink` `#1d7448` | Badge, borde KPI |
| Mejorar (70–84%) ◐ | `warning` `#a36200` | `warning-bg` `#fbecc8` | `warning-ink` `#945900` | Badge, borde KPI, "Parcial" seleccionado, barra de falla leve |
| Crítico (< 70%) ✕ | `error` `#c0332b` | `error-bg` `#f8dcd9` | `error-ink` `#b32f28` | Badge, borde KPI, "No" seleccionado, barra de falla grave, validación |

El color **fuerte** se usa para rellenos, bordes y como fondo de texto blanco. El texto de un badge sobre su `-bg` usa la variante **`-ink`**: los tonos fuertes quedan por debajo de 4.5:1 sobre su fondo tintado a 12px (ver Contraste).

Los umbrales viven solo en `src/config/scoring.ts` (`STATUS_THRESHOLDS`). Un badge de estado siempre muestra ícono + texto, nunca solo color.

Todas las superficies son de color plano: no hay degradados lineales ni radiales, ni sombras decorativas, en ninguna parte de la interfaz.

## Tipografía

Ambas familias se cargan con `next/font/google` en `src/app/layout.tsx` y se exponen como `--font-condensed` y `--font-inter`.

- **Barlow Condensed** 600/700: `h1`–`h3`, nombre de marca, nombres de sección, números 1S–5S, contadores de sección, porcentajes, cifras KPI y valores de barras.
- **Inter**: cuerpo, campos, botones, tablas y badges.
- **Etiquetas** de campos, etiquetas de KPI, eyebrows y encabezados de tabla: 12px, MAYÚSCULAS, peso 700, `letter-spacing: 0.8px`, color `muted`.
- Ningún título usa `letter-spacing` negativo.

## Forma y elevación

| Elemento | Radio |
|---|---|
| Botones, inputs, filtros, badges, números de sección, barras | `4px` |
| Tarjetas, paneles, barra de envío | `8px` (máximo) |

- Bordes: `1px solid gray`. Es la única forma de separación; no se usan sombras.
- No existen píldoras (`border-radius` grande); la clase `.pill` conserva su nombre pero es un botón rectangular de 4px.
- Altura mínima: 44px para botones y filtros; 48px para respuestas.

## Componentes

### Barra superior

Logotipo de `public/safe-demo_logo-blc-Photoroom.png` a 72px de ancho, recortado a la placa metálica (el lema del archivo es blanco y no se lee sobre `surface`). Junto a él, "5S" en navy con Barlow Condensed y el subtítulo en `muted`, 11px en mayúsculas. Borde inferior `gray`. Favicons y manifest en `public/favicon_io/`.

### Acciones

- Primaria: fondo `blue`, texto blanco; hover `blue-press`.
- Secundaria: fondo blanco, borde `gray`, texto navy; hover fondo `tint` y borde `blue`.
- Enlaces de texto: `blue` subrayado.
- Foco: `outline: 3px solid blue; outline-offset: 2px`. Dentro de la barra navy el contorno es blanco (azul sobre navy no llega a 3:1).

### Encabezado del check-list

Panel blanco con borde `gray` y radio 8px con Operador, Estación y Turno. Si falta un dato al enviar, toma el estado "sin contestar".

### Secciones 1S–5S

`<details>` dentro de una tarjeta blanca. El número es un cuadrado de 36px, radio 4px, fondo `blue`, texto blanco en Barlow Condensed. Nombre de sección en navy condensado, nombre japonés en `muted` y, a la derecha, "X de 3 contestadas". El encabezado no muestra puntos ni porcentaje. Hover del encabezado: `tint`.

### Respuestas Sí / Parcial / No

Control segmentado continuo de tres partes con el texto "Sí", "Parcial" y "No" únicamente (sin puntos): bordes `gray` compartidos, radio 4px solo en los extremos, alto mínimo 48px. Sin seleccionar: fondo blanco, texto `ink`, hover `tint`.

| Opción | Seleccionada | Ícono |
|---|---|---|
| Sí | fondo `blue`, texto blanco | ✓ |
| Parcial | fondo `warning`, texto blanco | ◐ |
| No | fondo `error`, texto blanco | ✕ |

El estado no depende solo del color: lleva ícono propio y `aria-pressed`. Los íconos son decorativos para lectores de pantalla.

### Pregunta sin contestar

Fondo `error-bg` y franja izquierda de 4px en `error`.

### Barra de envío

Franja fija inferior con fondo `surface` sólido y borde superior `gray`. Si el guardado falla, encima de la caja aparece el mensaje de error (`error-bg`, texto `error-ink`, franja izquierda de 4px en `error`, `role="alert"`) y el formulario conserva todo lo capturado. Dentro, caja navy con texto blanco y radio 8px. El botón "Enviar check-list" es blanco con texto navy (hover `tint`); deshabilitado al 55% de opacidad.

### Tablero

- **KPI**: tarjeta blanca, borde superior de 4px (`blue` para el promedio general y estaciones evaluadas; `success`/`warning`/`error` para sus categorías). Etiqueta en estilo de etiqueta; cifra de 44px en navy con Barlow Condensed.
- **Filtros de periodo**: botón blanco con borde `gray`; activo = fondo `tint` + borde `blue` + texto navy.
- **Badges de estado**: radio 4px, fondo `-bg`, texto `-ink`.
- **Barras**: pista `tint`, relleno `blue`. En "Puntos que más fallan" el relleno es `error` cuando un punto acumula al menos tantas respuestas "No" como "Parcial", y `warning` en caso contrario.
- **Semáforo por estación**: cada fila es un enlace; hover y fila seleccionada en `tint`, la seleccionada con franja izquierda de 4px en `blue`. Abre el panel "Detalle de la evaluación" con cada pregunta y su respuesta como badge (Sí = success ✓, Parcial = warning ◐, No = error ✕).
- **Tablas**: separadores `gray`, encabezados en estilo de etiqueta.

### Confirmación

Tarjeta blanca centrada: porcentaje grande en Barlow Condensed, badge de semáforo con ícono + texto y botón primario "Llenar otra estación".

## Puntos, porcentajes y dónde se muestran

- Sí = 2 pts, Parcial = 1 pt, No = 0 pts (`ANSWER_POINTS` en `src/config/scoring.ts`). Máximo 30 por evaluación (15 × 2) y 6 por S (3 × 2).
- Porcentaje = puntos / 30 × 100 redondeado; porcentaje por S = puntos de la S / 6 × 100. El cálculo vive solo en `src/lib/scoring.ts`.
- **Los puntos solo aparecen en la leyenda del formulario:** "Sí = se cumple (2 pts) · Parcial = se cumple a medias (1 pt) · No = no se cumple (0 pts)".
- Botones, encabezados de sección, confirmación, tablero, detalle, tablas, CSV y Excel muestran porcentaje y semáforo; nunca "pts" ni "X/30".
- En el PDF, los puntos aparecen solo en la nota de metodología: "Sí = 2 pts · Parcial = 1 pt · No = 0 pts. Porcentaje = puntos / 30 × 100."

## Exportar

### Control en el tablero

Botón único **Exportar** en la fila de filtros de periodo (alineado a la derecha; a todo el ancho en móvil): fondo `blue`, texto blanco, radio 4px, alto mínimo 44px, ícono de descarga y flecha. Abre un menú blanco con borde `1px gray`, radio 4px y sin sombra, con tres opciones de 44px de alto, cada una con ícono `blue` y texto navy: "CSV (.csv)", "Excel (.xlsx)" y "Reporte PDF (.pdf)". Hover y foco en `tint`.

- Accesibilidad: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`; opciones `role="menuitem"`. Flechas arriba/abajo (circulares), Inicio/Fin, Esc cierra y devuelve el foco al botón, Tab cierra.
- Mientras se genera: el botón dice "Generando…" y queda deshabilitado. Un error aparece bajo el botón con el estilo de error (`error-bg`, texto `error-ink`, franja izquierda `error`, `role="alert"`).
- Siempre exporta el periodo seleccionado.

### Excel

- Encabezados: relleno navy, texto blanco en negritas, bordes `gray`; primera fila congelada; autofiltro en "Semáforo por estación" y "Registros".
- Anchos de columna según el contenido (10–48 caracteres); texto largo (preguntas, comentarios, encabezados de respuestas) con ajuste de línea.
- Porcentajes como número con formato `0%`; fechas como fecha real con formato `yyyy-mm-dd hh:mm` en hora de planta.
- Semáforo y respuestas: relleno `*-bg` con texto `*-ink` en negritas y la palabra del estado (Cumple/Mejorar/Crítico, Sí/Parcial/No).

### PDF

- A4 vertical, márgenes de 36pt, fondo blanco, sin degradados ni sombras, radios 4px.
- Encabezado: "Auditoría 5S de Estaciones" en Barlow Condensed 700 navy, periodo y fecha/hora de generación con su zona horaria; línea inferior `1px gray`.
- KPI: 5 tarjetas con borde superior de 4px (`blue` para promedio y estaciones; `success`/`warning`/`error` para Cumplen/A mejorar/Críticas) y número de 28pt en Barlow Condensed navy.
- Leyenda del semáforo con badges.
- Tablas: encabezados en Inter 8.5pt MAYÚSCULAS con tracking, color `muted`; filas de una línea separadas por `1px gray` que nunca se parten entre páginas; textos largos con elipsis. Badge de semáforo con fondo `*-bg`, borde del color fuerte, ícono vectorial (✓, medio círculo, ✕) y texto, legible impreso en blanco y negro.
- Promedio por S: barras con pista `tint` y relleno `blue`. Puntos que más fallan: barra con el tramo de "No" en `error` y el de "Parcial" en `warning`, más el conteo en texto.
- Paginación: con más de 12 estaciones el semáforo pasa a su propia página; "Registros recientes" va en página propia con el encabezado repetido en cada página, hasta 200 filas ("Mostrando N de M registros…" si se recorta). Pie fijo con el nombre del sistema y "Página X de Y".
- Estado vacío en cada bloque: panel con "Aún no hay check-lists en este periodo".
- Fuentes: TTF estáticos en `src/assets/fonts/` (Inter 400/600/700, Barlow Condensed 600/700) registrados con `Font.register`; sin guiones automáticos.

## Contraste (WCAG 2.1 AA)

| Par | Ratio | Requisito |
|---|---|---|
| blanco / `blue` | 7.45 | 4.5 ✔ |
| blanco / `blue-press` | 9.40 | 4.5 ✔ |
| blanco / `navy` | 15.07 | 4.5 ✔ |
| `navy` / `surface` | 13.70 | 4.5 ✔ |
| `navy` / `tint` | 12.92 | 4.5 ✔ |
| `muted` / blanco | 5.87 | 4.5 ✔ |
| `muted` / `surface` | 5.34 | 4.5 ✔ |
| `muted` / `error-bg` | 4.54 | 4.5 ✔ |
| blanco / `warning` | 4.88 | 4.5 ✔ |
| blanco / `error` | 5.60 | 4.5 ✔ |
| `success-ink` / `success-bg` | 4.81 | 4.5 ✔ (`success` daría 4.44 ✘) |
| `warning-ink` / `warning-bg` | 4.86 | 4.5 ✔ (`warning` daría 4.17 ✘) |
| `error-ink` / `error-bg` | 4.84 | 4.5 ✔ (`error` daría 4.33 ✘) |
| foco `blue` / `surface` | 6.78 | 3.0 ✔ |
| foco blanco / `navy` | 15.07 | 3.0 ✔ |

## Respuesta

- Objetivos táctiles ≥ 44px; respuestas ≥ 48px.
- A 768px o menos: margen lateral de 16px, metadatos y paneles en una columna, KPI en dos columnas, botón de envío a todo el ancho y el encabezado del detalle se apila.
