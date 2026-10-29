import { Circle, Line, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { STATUS_META, type AuditStatus } from "@/config/scoring";
import { statusColors, theme } from "../theme";
import { RADIUS, s } from "./styles";

export const EMPTY_TEXT = "Aún no hay check-lists en este periodo";

/** Ícono por estado (forma distinta en cada uno para que se distinga impreso en blanco y negro). */
export function StatusIcon({ status, size = 8 }: { status: AuditStatus; size?: number }) {
  const color = statusColors[status].ink;
  return <Svg width={size} height={size} viewBox="0 0 8 8">
    {status === "success" && <Path d="M1 4.2 L3.1 6.3 L7 1.9" stroke={color} strokeWidth={1.4} fill="none" />}
    {status === "warning" && <><Circle cx={4} cy={4} r={3.2} stroke={color} strokeWidth={1} fill="none" /><Path d="M4 0.8 A3.2 3.2 0 0 1 4 7.2 Z" fill={color} /></>}
    {status === "error" && <><Line x1={1.5} y1={1.5} x2={6.5} y2={6.5} stroke={color} strokeWidth={1.4} /><Line x1={6.5} y1={1.5} x2={1.5} y2={6.5} stroke={color} strokeWidth={1.4} /></>}
  </Svg>;
}

/** Badge de semáforo: fondo suave, ícono y texto (nunca solo color). */
export function StatusBadge({ status, prefix }: { status: AuditStatus; prefix?: string }) {
  const colors = statusColors[status];
  return <View style={[s.badge, { backgroundColor: colors.bg, borderWidth: 0.75, borderColor: colors.strong }]}>
    <StatusIcon status={status} />
    <Text style={[s.badgeText, { color: colors.ink }]}>{prefix}{STATUS_META[status].label}</Text>
  </View>;
}

export function Block({ title, children, keepTogether = true }: { title: string; children: ReactNode; keepTogether?: boolean }) {
  return <View style={s.block} wrap={!keepTogether}><Text style={s.blockTitle}>{title}</Text>{children}</View>;
}

export const EmptyState = () => <View style={s.panel}><Text style={s.empty}>{EMPTY_TEXT}</Text></View>;

/** Barra horizontal con pista tint; `segments` en porcentaje (0–100) del ancho, uno tras otro. */
export function Bar({ width, segments }: { width: number; segments: { value: number; color: string }[] }) {
  const height = 9;
  const widths = segments.map((segment) => (segment.value > 0 ? Math.max(1, (Math.min(100, segment.value) / 100) * width) : 0));
  const offsets = widths.map((_, i) => widths.slice(0, i).reduce((sum, w) => sum + w, 0));
  return <Svg width={width} height={height}>
    <Rect x={0} y={0} width={width} height={height} rx={RADIUS / 2} fill={theme.tint} />
    {segments.map((segment, i) => widths[i] > 0 && <Rect key={i} x={offsets[i]} y={0} width={Math.min(widths[i], width - offsets[i])} height={height} rx={RADIUS / 2} fill={segment.color} />)}
  </Svg>;
}

export type Column<T> = { header: string; width?: number; flex?: number; align?: "left" | "right"; render: (row: T) => ReactNode };

const cellStyle = <T,>(column: Column<T>) => [s.cell, column.width ? { width: column.width } : { flex: column.flex ?? 1 }, column.align === "right" ? { textAlign: "right" as const, alignItems: "flex-end" as const } : {}];

/** Encabezado de tabla; con `fixed` se repite en cada página del mismo <Page>. */
export function TableHeader<T>({ columns, fixed = false }: { columns: Column<T>[]; fixed?: boolean }) {
  return <View style={s.tableHeader} fixed={fixed}>{columns.map((column) => <Text key={column.header} style={[...cellStyle(column), s.label]}>{column.header}</Text>)}</View>;
}

/** Fila que nunca se parte entre páginas; el texto largo se recorta con elipsis. */
export function TableRow<T>({ columns, row }: { columns: Column<T>[]; row: T }) {
  return <View style={s.tableRow} wrap={false}>{columns.map((column) => {
    const content = column.render(row);
    return <View key={column.header} style={cellStyle(column)}>{typeof content === "string" || typeof content === "number" ? <Text style={[s.ellipsis, column.align === "right" ? { textAlign: "right" } : {}]}>{content}</Text> : content}</View>;
  })}</View>;
}
