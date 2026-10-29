import { describe, expect, it } from "vitest";
import { formatLocalDate, formatLocalDateTime, localWallClock, parsePeriod, periodStart } from "./period";

const MX = "America/Mexico_City"; // UTC−6 sin horario de verano.

describe("periodos en zona horaria local", () => {
  it("Hoy empieza a medianoche de Ciudad de México, no de UTC", () => {
    // 01:30 UTC del 29 = 19:30 del 28 en CDMX.
    expect(periodStart("today", new Date("2026-10-29T01:30:00Z"), MX)!.toISOString()).toBe("2026-10-28T06:00:00.000Z");
    expect(periodStart("today", new Date("2026-10-29T18:00:00Z"), MX)!.toISOString()).toBe("2026-10-29T06:00:00.000Z");
  });
  it("7 y 30 días incluyen hoy completo", () => {
    const now = new Date("2026-10-29T18:00:00Z");
    expect(periodStart("7d", now, MX)!.toISOString()).toBe("2026-10-23T06:00:00.000Z");
    expect(periodStart("30d", now, MX)!.toISOString()).toBe("2026-09-30T06:00:00.000Z");
  });
  it("Todo no tiene límite", () => expect(periodStart("all", new Date(), MX)).toBeNull());
  it("respeta cambios de horario en otras zonas", () => {
    // Nueva York pasa a horario estándar el 1 de noviembre de 2026.
    expect(periodStart("today", new Date("2026-11-01T15:00:00Z"), "America/New_York")!.toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(periodStart("today", new Date("2026-11-02T15:00:00Z"), "America/New_York")!.toISOString()).toBe("2026-11-02T05:00:00.000Z");
  });
  it("un periodo desconocido usa 7 días", () => {
    expect(parsePeriod("x")).toBe("7d");
    expect(parsePeriod(undefined)).toBe("7d");
    expect(parsePeriod("30d")).toBe("30d");
    expect(parsePeriod("30")).toBe("30d");
  });
  it("formatea fecha y hora locales", () => {
    const at = new Date("2026-10-29T01:30:00Z");
    expect(formatLocalDateTime(at, MX)).toBe("2026-10-28 19:30");
    expect(formatLocalDate(at, MX)).toBe("2026-10-28");
    expect(localWallClock(at, MX).toISOString()).toBe("2026-10-28T19:30:00.000Z");
  });
});
