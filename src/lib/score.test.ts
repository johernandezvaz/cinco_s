import { describe, expect, it } from "vitest";
import { percentageFromValues, statusFor } from "./score";
describe("puntaje 5S", () => { it("calcula el porcentaje sobre dos puntos por reactivo", () => expect(percentageFromValues([2, 1, 0])).toBe(50)); it("clasifica los límites del semáforo", () => { expect(statusFor(85)).toBe("success"); expect(statusFor(70)).toBe("warning"); expect(statusFor(69)).toBe("error"); }); });
