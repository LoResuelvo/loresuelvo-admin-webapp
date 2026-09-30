import "server-only";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import { OperationError } from "@/domain/operations/operation-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapAuditedConversation } from "./mappers/audited-conversation-mapper";

async function getE2EAuditedConversationStub(id: string, cursor?: string): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    const query = cursor ? `?${new URLSearchParams({ cursor })}` : "";
    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === `/admin/operations/${id}/conversation${query}` ||
            s.endpoint === `/operations/${id}/conversation${query}`),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function resolveAuditedConversationFromStub(
  stub: ApiStub,
): Promise<AuditedConversationResult> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 404) {
    throw new OperationError("not_found", "Conversation not found");
  }
  if (stub.status === 403) {
    throw new OperationError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new OperationError("unavailable", `Failed to fetch conversation: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new OperationError("unknown", `Failed to fetch conversation: ${stub.status}`);
  }

  return mapAuditedConversation(stub.body);
}

function handleAuditedConversationHttpError(status: number): never {
  if (status === 404) {
    throw new OperationError("not_found", "Conversation not found");
  }
  if (status === 403) {
    throw new OperationError("forbidden", "Forbidden");
  }
  if (status >= 500) {
    throw new OperationError("unavailable", `Failed to fetch conversation: ${status}`);
  }
  throw new OperationError("unknown", `Failed to fetch conversation: ${status}`);
}

async function fetchAuditedConversationFromApi(
  token: string,
  id: string,
  reason: string,
  cursor?: string,
): Promise<AuditedConversationResult> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/operations/${encodeURIComponent(id)}/conversation`);
  if (cursor) url.searchParams.set("cursor", cursor);
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Audit-Reason": reason,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err: unknown) {
    if (err instanceof OperationError) throw err;
    throw new OperationError("unavailable", "Network error when fetching conversation");
  }

  if (!response.ok) {
    handleAuditedConversationHttpError(response.status);
  }

  const data = await response.json();
  return mapAuditedConversation(data);
}

export async function fetchOrResolveAuditedConversation(
  token: string,
  id: string,
  reason: string,
  cursor?: string,
): Promise<AuditedConversationResult> {
  const stub = await getE2EAuditedConversationStub(id, cursor);
  if (stub) {
    return resolveAuditedConversationFromStub(stub);
  }
  return fetchAuditedConversationFromApi(token, id, reason, cursor);
}
