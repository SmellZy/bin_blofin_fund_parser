import { getMonitor } from "@/lib/monitor-service";

export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

export async function GET() {
  const payload = await getMonitor();
  return Response.json(payload, { headers: { "Cache-Control": "no-store" } });
}
