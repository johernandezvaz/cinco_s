---
version: 1.0
name: 5S Industrial Audit
description: Sistema visual sobrio para auditorías operativas de manufactura. Prioriza contraste, legibilidad en tablet y controles táctiles claros.
---

# Diseño de Auditoría 5S

## Color

| Token | Valor | Uso |
|---|---|---|
| `blue` | `#1d559a` | Acción principal, enlace, foco y rellenos de barras |
| `blue-press` | `#174682` | Estado hover y activo |
| `navy` | `#0e254e` | Títulos, texto fuerte y barra de envío |
| `gray` | `#dfe1e7` | Bordes y separadores |
| `surface` | `#f3f4f7` | Fondo de página y superficies secundarias |
| `tint` | `#e8eef7` | Filtros activos y pistas de barras |
| `ink` | `#0e254e` | Texto principal |
| `muted` | `#5b6578` | Texto secundario y etiquetas |
| `white` | `#ffffff` | Tarjetas y controles |
| `success` / `success-bg` | `#1e7a4c` / `#dcefe4` | Estado cumple |
| `warning` / `warning-bg` | `#a36200` / `#fbecc8` | Estado mejorar |
| `error` / `error-bg` | `#c0332b` / `#f8dcd9` | Estado crítico y validación |

No se usan efectos decorativos de color ni sombras. Todo color de interfaz se consume desde tokens CSS definidos en `src/app/globals.css` y se replica en `tailwind.config.ts`.

## Tipografía

- **Barlow Condensed**, pesos 600 y 700, para títulos, indicadores KPI, números de sección y valores grandes.
- **Inter** para cuerpo, campos, tablas y controles.
- Etiquetas y encabezados de tabla: 12px, mayúsculas, peso 700, tracking `0.8px`, color `muted`.
- Los títulos no usan tracking negativo.

## Forma y elevación

- Controles, filtros y badges: radio `4px`.
- Tarjetas y paneles: radio máximo `8px`.
- Bordes: `1px solid gray`.
- Sin sombras decorativas.
- Los botones tienen una altura mínima de 44px; las respuestas, 48px.

## Componentes

### Navegación

La barra superior usa el logotipo ubicado en `public/`, el nombre en navy y el subtítulo en muted. Sus bordes son finos y no utiliza una superficie coloreada adicional.

### Acciones

La acción principal lleva fondo `blue` y texto blanco; al pasar el cursor usa `blue-press`. Las acciones secundarias usan fondo blanco y borde gray. El foco es `3px solid blue` con offset de 2px.

### Respuestas 5S

Cada pregunta contiene un control segmentado continuo de tres opciones. La selección se identifica por texto, color e icono de confirmación; no depende solamente del color. El control tiene extremos de 4px y mínimo 48px de alto.

Los identificadores 1S–5S son cuadros de 36px con fondo blue, tipografía condensada y radio 4px. Una pregunta pendiente se muestra con fondo `error-bg` y franja izquierda de 4px en `error`.

### Paneles y tablero

Tarjetas, paneles y tablas tienen fondo white, borde gray y radio 8px. Los KPI usan borde superior de 4px: blue para promedio, y los tonos semáforo para sus categorías. Sus valores son navy con Barlow Condensed.

Las barras usan pista tint y relleno blue. Los badges usan fondo y texto del par semáforo correspondiente. El filtro activo usa fondo tint, borde blue y texto navy.

### Barra de envío

La barra fija tiene superficie navy y texto blanco. Su acción usa fondo white y texto navy; en estado deshabilitado mantiene 55% de opacidad.

## Accesibilidad y respuesta

- Contraste mínimo AA para todo texto y estado.
- Objetivos táctiles de al menos 44px; respuestas de 48px.
- Foco visible en teclado.
- A 768px o menos, metadatos y paneles pasan a una columna y los KPI a dos columnas.
