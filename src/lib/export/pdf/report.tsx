import { Document, Page, renderToBuffer, Text, View } from "@react-pdf/renderer";
import { STATUS_META, STATUS_THRESHOLDS } from "@/config/scoring";
import type { DashboardData } from "@/lib/dashboard-data";
import { formatLocalDateTime } from "@/lib/period";
import { methodologyNote } from "@/lib/scoring";
import { statusColors, SYSTEM_NAME, theme } from "../theme";
import { Bar, Block, EmptyState, StatusBadge, TableHeader, TableRow, type Column } from "./components";
import { registerFonts } from "./fonts";
import { CONTENT_WIDTH, s } from "./styles";

/** Máximo de registros en el PDF; el resto queda en Excel/CSV. */
export const MAX_PDF_RECORDS = 200;
/** Con hasta este número de estaciones el semáforo cabe en la primera página. */
const INLINE_STATIONS = 12;

type Station = DashboardData["stations"][number];
type RecordRow = DashboardData["records"][number];

const BAR_LABEL = 150;
const PANEL_INNER = CONTENT_WIDTH - 20;

function Footer() {
  return <View style={s.footer} fixed>
    <Text>{SYSTEM_NAME}</Text>
    <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
  </View>;
}

function Kpi({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <View style={[s.kpi, { borderTopColor: color }]}><Text style={s.label}>{label}</Text><Text style={s.kpiValue}>{value}</Text></View>;
}

function Report({ data }: { data: DashboardData }) {
  const at = (date: Date) => formatLocalDateTime(date, data.timeZone);
  const percentCell = (percentage: number) => <Text style={{ fontWeight: 700, textAlign: "right" }}>{percentage}%</Text>;
  const stationColumns: Column<Station>[] = [
    { header: "Estación", flex: 1.3, render: (row) => row.station },
    { header: "Operador", flex: 1.2, render: (row) => row.operator },
    { header: "Turno", width: 50, render: (row) => row.shift },
    { header: "Fecha", width: 86, render: (row) => at(row.createdAt) },
    { header: "Porcentaje", width: 68, align: "right", render: (row) => percentCell(row.percentage) },
    { header: "Semáforo", width: 70, render: (row) => <StatusBadge status={row.status} /> },
  ];
  const recordColumns: Column<RecordRow>[] = [
    { header: "Fecha", width: 86, render: (row) => at(row.createdAt) },
    { header: "Estación", flex: 1.3, render: (row) => row.station },
    { header: "Operador", flex: 1.2, render: (row) => row.operator },
    { header: "Turno", width: 50, render: (row) => row.shift },
    { header: "Porcentaje", width: 68, align: "right", render: (row) => percentCell(row.percentage) },
    { header: "Semáforo", width: 70, render: (row) => <StatusBadge status={row.status} /> },
  ];
  const inlineStations = data.stations.length <= INLINE_STATIONS;
  const shown = data.records.slice(0, MAX_PDF_RECORDS);
  const average = data.kpis.average === null ? "—" : `${data.kpis.average}%`;

  return <Document title={`${SYSTEM_NAME} · ${data.periodLabel}`} author={SYSTEM_NAME} creator={SYSTEM_NAME} producer={SYSTEM_NAME} language="es">
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>{SYSTEM_NAME}</Text>
        <View style={s.meta}>
          <Text><Text style={s.metaLabel}>Periodo: </Text>{data.periodLabel}</Text>
          <Text><Text style={s.metaLabel}>Generado: </Text>{at(data.generatedAt)} ({data.timeZone})</Text>
        </View>
      </View>

      <View style={s.kpiRow} wrap={false}>
        <Kpi label="Promedio general" value={average} color={theme.blue} />
        <Kpi label="Estaciones evaluadas" value={data.kpis.stations} color={theme.blue} />
        <Kpi label="Cumplen" value={data.kpis.success} color={statusColors.success.strong} />
        <Kpi label="A mejorar" value={data.kpis.warning} color={statusColors.warning.strong} />
        <Kpi label="Críticas" value={data.kpis.error} color={statusColors.error.strong} />
      </View>
      <View style={s.legend} wrap={false}>
        <StatusBadge status="success" /><Text>≥ {STATUS_THRESHOLDS.success}%</Text>
        <StatusBadge status="warning" /><Text>{STATUS_THRESHOLDS.warning}–{STATUS_THRESHOLDS.success - 1}%</Text>
        <StatusBadge status="error" /><Text>&lt; {STATUS_THRESHOLDS.warning}%</Text>
      </View>

      {inlineStations && <Block title="Semáforo por estación">
        {data.stations.length ? <View><TableHeader columns={stationColumns} />{data.stations.map((row) => <TableRow key={row.id} columns={stationColumns} row={row} />)}</View> : <EmptyState />}
      </Block>}

      <Block title="Promedio por S">
        {data.sections.length ? <View style={s.panel}>{data.sections.map((section) => <View key={section.id} style={s.barRow}>
          <Text style={s.barLabel}>{section.number}S {section.name}</Text>
          <Bar width={PANEL_INNER - BAR_LABEL - 36 - 16} segments={[{ value: section.percentage, color: theme.blue }]} />
          <Text style={s.barValue}>{section.percentage}%</Text>
        </View>)}</View> : <EmptyState />}
      </Block>

      <Block title="Puntos que más fallan">
        {data.failures.length ? <View style={s.panel}>
          {data.failures.map((item) => <View key={item.questionId} style={s.barRow}>
            <Text style={[s.barLabel, s.ellipsis]}>{item.code} {item.short}</Text>
            <Bar width={PANEL_INNER - BAR_LABEL - 120 - 36 - 24} segments={[{ value: (item.no / data.kpis.evaluations) * 100, color: statusColors.error.strong }, { value: (item.parcial / data.kpis.evaluations) * 100, color: statusColors.warning.strong }]} />
            <Text style={s.barNote}>No {item.no} · Parcial {item.parcial} · {STATUS_META[item.severity].label}</Text>
            <Text style={s.barValue}>{item.rate}%</Text>
          </View>)}
          <Text style={s.note}>Barra: proporción de evaluaciones del periodo con &quot;No&quot; (rojo) y &quot;Parcial&quot; (ámbar) en ese punto. El porcentaje es el incumplimiento total.</Text>
        </View> : <EmptyState />}
      </Block>
      <Footer />
    </Page>

    {!inlineStations && <Page size="A4" style={s.page}>
      <Text style={s.blockTitle}>Semáforo por estación</Text>
      <TableHeader columns={stationColumns} fixed />
      {data.stations.map((row) => <TableRow key={row.id} columns={stationColumns} row={row} />)}
      <Footer />
    </Page>}

    <Page size="A4" style={s.page}>
      <Text style={s.blockTitle}>Registros recientes</Text>
      {shown.length ? <>
        <TableHeader columns={recordColumns} fixed />
        {shown.map((row) => <TableRow key={row.id} columns={recordColumns} row={row} />)}
        {data.records.length > shown.length && <Text style={s.note} wrap={false}>Mostrando {shown.length} de {data.records.length} registros. El detalle completo está en el Excel o CSV.</Text>}
      </> : <EmptyState />}
      <Text style={s.methodology} wrap={false}>Metodología: {methodologyNote()}</Text>
      <Footer />
    </Page>
  </Document>;
}

export async function buildPdf(data: DashboardData) {
  registerFonts();
  return renderToBuffer(<Report data={data} />);
}
