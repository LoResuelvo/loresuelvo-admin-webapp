import { AccessError } from "@/domain/auth/access-error";
import { verifyAdminAccess } from "@/application/auth/verify-admin-access";
import { authSession } from "@/infrastructure/auth/auth-session";
import { apiProfileRepository } from "@/infrastructure/repositories/api-profile-repository";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const profile = await verifyAdminAccess(authSession, apiProfileRepository);
    return Response.json({ status: "ready", profile }, { headers });
  } catch (error: unknown) {
    if (error instanceof AccessError && (error.code === "unauthenticated" || error.code === "sessionExpired")) {
      return Response.json({ status: error.code }, { status: 401, headers });
    }
    if (error instanceof AccessError && error.code === "notProvisioned") {
      return Response.json({ status: "notProvisioned" }, { status: 404, headers });
    }
    if (error instanceof AccessError && error.code === "forbidden") {
      return Response.json({ status: "forbidden" }, { status: 403, headers });
    }
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
