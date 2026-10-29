export const PERIODS = [
  { key: "today", label: "Hoy", days: 1 },
  { key: "7d", label: "Últimos 7 días", days: 7 },
  { key: "30d", label: "30 días", days: 30 },
  { key: "all", label: "Todo", days: null },
] as const;
export type Period = (typeof PERIODS)[number]["key"];
export const DEFAULT_PERIOD: Period = "7d";
export const PERIOD_KEYS = PERIODS.map((period) => period.key) as [Period, ...Period[]];
// Enlaces anteriores usaban "7" y "30".
const LEGACY: Record<string, Period> = { "7": "7d", "30": "30d" };

export const parsePeriod = (value: string | null | undefined): Period => PERIODS.find((period) => period.key === value)?.key ?? (value ? LEGACY[value] : undefined) ?? DEFAULT_PERIOD;
export const periodLabel = (period: Period) => PERIODS.find((item) => item.key === period)!.label;

/** Desfase (ms) de `timeZone` respecto a UTC en el instante `at`. */
function offsetMs(at: number, timeZone: string) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(at).map((p) => [p.type, Number(p.value)]));
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - Math.floor(at / 1000) * 1000;
}

/** Medianoche local (en `timeZone`) del día de `now` menos `daysBack` días, como instante UTC. */
export function startOfLocalDay(now: Date, timeZone: string, daysBack = 0) {
  const local = new Date(now.getTime() + offsetMs(now.getTime(), timeZone));
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysBack);
  // Dos pasadas para respetar cambios de horario entre `now` y la medianoche buscada.
  const guess = midnight - offsetMs(midnight, timeZone);
  return new Date(midnight - offsetMs(guess, timeZone));
}

/** Inicio del periodo: "Hoy" desde las 00:00 locales; 7 y 30 días incluyen hoy completo. `null` = sin límite. */
export function periodStart(period: Period, now: Date, timeZone: string) {
  const days = PERIODS.find((item) => item.key === period)!.days;
  return days === null ? null : startOfLocalDay(now, timeZone, days - 1);
}

/** Fecha cuyos componentes UTC son la hora de pared en `timeZone` (para Excel, que no maneja zonas). */
export const localWallClock = (date: Date, timeZone: string) => new Date(date.getTime() + offsetMs(date.getTime(), timeZone));

const pad = (n: number) => String(n).padStart(2, "0");
/** "YYYY-MM-DD" en `timeZone`. */
export function formatLocalDate(date: Date, timeZone: string) {
  const local = localWallClock(date, timeZone);
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
}
/** "YYYY-MM-DD HH:mm" en `timeZone`. */
export function formatLocalDateTime(date: Date, timeZone: string) {
  const local = localWallClock(date, timeZone);
  return `${formatLocalDate(date, timeZone)} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
}
