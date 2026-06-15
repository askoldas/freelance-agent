import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export function GET() {
  logger.debug("Health check requested");

  return Response.json({
    ok: true,
    service: "freelance-agent",
    timestamp: new Date().toISOString()
  });
}
