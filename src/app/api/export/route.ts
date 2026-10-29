import { TIME_ZONE } from "@/config/scoring";
import { getDashboardData } from "@/lib/dashboard-data";
import { createExport, exportQuerySchema } from "@/lib/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = exportQuerySchema.safeParse({ format: params.get("format") ?? undefined, period: params.get("period") ?? undefined });
  if (!query.success) return Response.json({ error: query.error.issues.map((issue) => issue.message).join(" ") }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    const data = await getDashboardData(query.data.period, TIME_ZONE);
    const file = await createExport(query.data.format, data);
    return new Response(new Uint8Array(file.body), { headers: { "Content-Type": file.contentType, "Content-Disposition": `attachment; filename="${file.fileName}"`, "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("No se pudo generar la exportación", error);
    return Response.json({ error: "No se pudo generar el archivo. Inténtalo de nuevo." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
