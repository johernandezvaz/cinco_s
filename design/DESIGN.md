---
version: 2.0
name: 5S Industrial Audit
description: Sistema visual sobrio para auditorías operativas de manufactura. Azul/navy sobre superficie gris clara, formas rectas, tipografía condensada para títulos y cifras. Prioriza contraste, legibilidad en tablet y controles táctiles claros.
---

# Diseño de Auditoría 5S

> Fuente de verdad del código: `src/app/globals.css` (`:root`). `tailwind.config.ts` solo referencia esas variables (`var(--blue)`, …); ningún componente usa hex directos.

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
| Cumple (≥ 85%) | `success` `#1e7a4c` | `success-bg` `#dcefe4` | `success-ink` `#1d7448` | Badge, borde KPI |
| Mejorar (70–84%) | `warning` `#a36200` | `warning-bg` `#fbecc8` | `warning-ink` `#945900` | Badge, borde KPI, "Parcial" seleccionado, barra de falla leve |
| Crítico (< 70%) | `error` `#c0332b` | `error-bg` `#f8dcd9` | `error-ink` `#b32f28` | Badge, borde KPI, "No" seleccionado, barra de falla grave, validación |

El color **fuerte** se usa para rellenos, bordes y como fondo de texto blanco. El texto de un badge sobre su `-bg` usa la variante **`-ink`**: los tonos fuertes quedan por debajo de 4.5:1 sobre su fondo tintado a 12px (ver Contraste).

Todas las superficies son de color plano: no hay degradados lineales ni radiales, ni sombras decorativas, en ninguna parte de la interfaz.

## Tipografía

Ambas familias se cargan con `next/font/google` en `src/app/layout.tsx` y se exponen como `--font-condensed` y `--font-inter`.

- **Barlow Condensed** 600/700: `h1`–`h3`, nombre de marca, nombres de sección, números 1S–5S, puntajes, cifras KPI y valores de barras.
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

`<details>` dentro de una tarjeta blanca. El número es un cuadrado de 36px, radio 4px, fondo `blue`, texto blanco en Barlow Condensed. Nombre de sección en navy condensado, nombre japonés en `muted`, puntaje a la derecha. Hover del encabezado: `tint`.

### Respuestas Sí / Parcial / No

Control segmentado continuo de tres partes: bordes `gray` compartidos, radio 4px solo en los extremos, alto mínimo 48px. Sin seleccionar: fondo blanco, texto `ink`, hover `tint`.

| Opción | Seleccionada | Ícono |
|---|---|---|
| Sí | fondo `blue`, texto blanco | ✓ |
| Parcial | fondo `warning`, texto blanco | ◐ |
| No | fondo `error`, texto blanco | ✕ |

El estado no depende solo del color: lleva ícono propio y `aria-pressed`. Los íconos son decorativos para lectores de pantalla.

### Pregunta sin contestar

Fondo `error-bg` y franja izquierda de 4px en `error`.

### Barra de envío

Franja fija inferior con fondo `surface` sólido y borde superior `gray`. Dentro, caja navy con texto blanco y radio 8px. El botón "Enviar check-list" es blanco con texto navy (hover `tint`); deshabilitado al 55% de opacidad.

### Tablero

- **KPI**: tarjeta blanca, borde superior de 4px (`blue` para el promedio general y estaciones evaluadas; `success`/`warning`/`error` para sus categorías). Etiqueta en estilo de etiqueta; cifra de 44px en navy con Barlow Condensed.
- **Filtros de periodo**: botón blanco con borde `gray`; activo = fondo `tint` + borde `blue` + texto navy.
- **Badges de estado**: radio 4px, fondo `-bg`, texto `-ink`.
- **Barras**: pista `tint`, relleno `blue`. En "Puntos que más fallan" el relleno es `error` cuando un punto acumula al menos tantas respuestas "No" como "Parcial", y `warning` en caso contrario.
- **Tablas**: separadores `gray`, encabezados en estilo de etiqueta.

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
- A 768px o menos: margen lateral de 16px, metadatos y paneles en una columna, KPI en dos columnas, botón de envío a todo el ancho y la pista de puntos de cada respuesta pasa a segunda línea.
