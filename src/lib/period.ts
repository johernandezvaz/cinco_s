export const PERIODS = [
  { key: "today", label: "Hoy", days: 1 },
  { key: "7", label: "Últimos 7 días", days: 7 },
  { key: "30", label: "30 días", days: 30 },
  { key: "all", label: "Todo", days: null },
] as const;
export type Period = (typeof PERIODS)[number]["key"];
export const DEFAULT_PERIOD: Period = "7";

export const parsePeriod = (value: string | null | undefined): Period => PERIODS.find((period) => period.key === value)?.key ?? DEFAULT_PERIOD;

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
