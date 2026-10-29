import { StyleSheet } from "@react-pdf/renderer";
import { fonts, theme } from "../theme";

export const PAGE = { width: 595.28, margin: 36 };
export const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
export const RADIUS = 4;

const heading = { fontFamily: fonts.heading.family, fontWeight: 700 as const, color: theme.navy };

export const s = StyleSheet.create({
  page: { paddingTop: PAGE.margin, paddingHorizontal: PAGE.margin, paddingBottom: 56, fontFamily: fonts.body.family, fontSize: 9, color: theme.ink, backgroundColor: theme.white },
  header: { borderBottomWidth: 1, borderBottomColor: theme.gray, paddingBottom: 10, marginBottom: 14 },
  title: { ...heading, fontSize: 24, lineHeight: 1.1 },
  meta: { flexDirection: "row", gap: 16, marginTop: 4, color: theme.muted, fontSize: 9 },
  metaLabel: { fontWeight: 600, color: theme.ink },
  label: { fontSize: 8.5, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", color: theme.muted },
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  kpi: { flex: 1, borderWidth: 1, borderColor: theme.gray, borderTopWidth: 4, borderRadius: RADIUS, paddingHorizontal: 8, paddingVertical: 8, minHeight: 66 },
  kpiValue: { ...heading, fontSize: 28, lineHeight: 1, marginTop: "auto" },
  legend: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 14 },
  block: { marginBottom: 14 },
  blockTitle: { ...heading, fontSize: 15, marginBottom: 6 },
  panel: { borderWidth: 1, borderColor: theme.gray, borderRadius: RADIUS, paddingHorizontal: 10, paddingVertical: 8 },
  empty: { color: theme.muted, paddingVertical: 10 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 },
  barLabel: { width: 150 },
  barValue: { ...heading, fontSize: 12, width: 36, textAlign: "right" },
  barNote: { color: theme.muted, fontSize: 8, width: 120 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: theme.gray, paddingVertical: 5 },
  tableRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.gray, minHeight: 20, paddingVertical: 3 },
  cell: { paddingRight: 6 },
  ellipsis: { maxLines: 1, textOverflow: "ellipsis" },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, alignSelf: "flex-start", borderRadius: RADIUS, paddingHorizontal: 5, paddingVertical: 2 },
  badgeText: { fontSize: 8, fontWeight: 700 },
  note: { color: theme.muted, fontSize: 8, marginTop: 6 },
  methodology: { marginTop: 12, paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.gray, color: theme.muted, fontSize: 8 },
  footer: { position: "absolute", left: PAGE.margin, right: PAGE.margin, bottom: 24, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: theme.gray, paddingTop: 6, color: theme.muted, fontSize: 8 },
});
