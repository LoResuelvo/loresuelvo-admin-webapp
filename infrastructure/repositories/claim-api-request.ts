import "server-only";
import { ClaimError } from "@/domain/claims/claim-error";

type ClaimRequest = { method: "POST"; body?: unknown; idempotencyKey: string };

export async function requestClaimApi(token: string, path: string, request?: ClaimRequest): Promise<unknown> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) throw new ClaimError("unavailable", "API is not configured");
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}/admin/claims${path}`, {
      method: request?.method,
      headers: {
        Authorization: `Bearer ${token}`, Accept: "application/json",
        ...(request ? { "Content-Type": "application/json", "Idempotency-Key": request.idempotencyKey } : {}),
      },
      ...(request?.body !== undefined ? { body: JSON.stringify(request.body) } : {}),
      cache: "no-store", signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ClaimError("unavailable", "Claim API unavailable");
  }
  if (response.status === 403) throw new ClaimError("forbidden", "Forbidden");
  if (response.status === 404) throw new ClaimError("notFound", "Claim not found");
  if (!response.ok) throw new ClaimError(response.status >= 500 ? "unavailable" : "unknown", "Claim request failed");
  return response.json();
}
