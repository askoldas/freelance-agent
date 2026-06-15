import { env } from "@/config/env";

export function isAuthorizedCronRequest(request: Request): boolean {
  if (!env.CRON_SECRET) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const urlSecret = new URL(request.url).searchParams.get("secret");

  return (
    authorization === `Bearer ${env.CRON_SECRET}` ||
    headerSecret === env.CRON_SECRET ||
    urlSecret === env.CRON_SECRET
  );
}
