import { describe, expect, it } from "vitest";
import { checklist, questions } from "@/config/checklist";
import type { AnswerValue } from "@/config/scoring";
import { answerLegend, average, methodologyNote, MAX_SCORE, scoreAudit, sectionAverages, sectionMaxScore, sectionPercentage, statusFor, statusLabel, toPercentage, type Answers } from "./scoring";

const all = (value: AnswerValue): Answers => Object.fromEntries(questions.map((q) => [q.id, value]));
const [seiri] = checklist;

describe("puntos por evaluación", () => {
  it("máximo de 30 puntos y 6 por S", () => {
    expect(MAX_SCORE).toBe(30);
    checklist.forEach((section) => expect(sectionMaxScore(section)).toBe(6));
  });
  it("todo Sí = 30 pts y 100%", () => expect(scoreAudit(all("si"))).toEqual({ score: 30, percentage: 100 }));
  it("todo No = 0 pts y 0%", () => expect(scoreAudit(all("no"))).toEqual({ score: 0, percentage: 0 }));
  it("todo Parcial = 15 pts y 50%", () => expect(scoreAudit(all("parcial"))).toEqual({ score: 15, percentage: 50 }));
  it("mezcla: 10 Sí, 3 Parcial, 2 No = 23 pts y 77%", () => {
    const answers = Object.fromEntries(questions.map((q, i) => [q.id, i < 10 ? "si" : i < 13 ? "parcial" : "no"])) as Answers;
    expect(scoreAudit(answers)).toEqual({ score: 23, percentage: 77 });
  });
  it("redondea al entero más cercano", () => {
    expect(toPercentage(25, 30)).toBe(83); // 83.33
    expect(toPercentage(26, 30)).toBe(87); // 86.67
    expect(toPercentage(1, 6)).toBe(17); // 16.67
  });
  it("rechaza evaluaciones incompletas", () => {
    const answers = all("si");
    delete answers.q7;
    expect(() => scoreAudit(answers)).toThrow(/q7/);
  });
});

describe("porcentaje por S", () => {
  it("se calcula sobre 6 puntos", () => {
    expect(sectionPercentage(seiri, { q1: "si", q2: "si", q3: "si" })).toBe(100);
    expect(sectionPercentage(seiri, { q1: "si", q2: "parcial", q3: "no" })).toBe(50);
    expect(sectionPercentage(seiri, { q1: "si", q2: "si", q3: "parcial" })).toBe(83);
    expect(sectionPercentage(seiri, { q1: "parcial", q2: "no", q3: "no" })).toBe(17);
  });
  it("promedia la S entre evaluaciones", () => {
    const sections = sectionAverages([all("si"), all("parcial")]);
    expect(sections).toHaveLength(5);
    sections.forEach((section) => expect(section.percentage).toBe(75));
  });
  it("promedio vacío = null", () => {
    expect(average([])).toBeNull();
    expect(average([85, 70])).toBe(78);
  });
});

describe("semáforo", () => {
  it.each([[100, "success"], [85, "success"], [84, "warning"], [70, "warning"], [69, "error"], [0, "error"]] as const)("%i%% → %s", (percentage, status) => expect(statusFor(percentage)).toBe(status));
  it("etiquetas", () => {
    expect(statusLabel(85)).toBe("Cumple");
    expect(statusLabel(84)).toBe("Mejorar");
    expect(statusLabel(69)).toBe("Crítico");
  });
});

describe("leyenda", () => {
  it("es el texto exacto del formulario", () => expect(answerLegend()).toBe("Sí = se cumple (2 pts) · Parcial = se cumple a medias (1 pt) · No = no se cumple (0 pts)"));
  it("nota de metodología del PDF", () => expect(methodologyNote()).toBe("Sí = 2 pts · Parcial = 1 pt · No = 0 pts. Porcentaje = puntos / 30 × 100."));
});
