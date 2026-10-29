import { describe, expect, it } from "vitest";
import { GET } from "./route";

const call = (query: string) => GET(new Request(`http://localhost/api/export${query}`));

describe("GET /api/export: validación", () => {
  it.each(["?format=doc&period=7d", "?format=csv&period=7", "?format=pdf&period=semana", "?period=7d", ""])("400 con %j", async (query) => {
    const response = await call(query);
    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect((await response.json()).error).toBeTruthy();
  });
});
