import { verifyAdminAccess } from "@/application/auth/verify-admin-access";
import { authSession } from "@/infrastructure/auth/auth-session";
import { apiProfileRepository } from "@/infrastructure/repositories/api-profile-repository";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const profile = await verifyAdminAccess(authSession, apiProfileRepository);
    return Response.json({ status: "ready", profile }, { headers });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
