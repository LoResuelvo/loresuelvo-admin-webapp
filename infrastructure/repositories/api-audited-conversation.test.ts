import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOrResolveAuditedConversation } from "./api-audited-conversation";

describe("fetchOrResolveAuditedConversation", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it("resends the audit reason and opaque cursor for the next page", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      operation_id: "jr-101", conversation_id: 9, job_request_id: 101, service_proposal_id: null,
      related_service_proposal_ids: [], shared_conversation: false, messages: [], next_cursor: null,
    })));
    vi.stubGlobal("fetch", fetcher);

    await fetchOrResolveAuditedConversation("token", "jr-101", "Reclamo de cliente", "signed+/cursor");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/operations/jr-101/conversation?cursor=signed%2B%2Fcursor",
      expect.objectContaining({ headers: { Authorization: "Bearer token", "X-Audit-Reason": "Reclamo de cliente", Accept: "application/json" }, cache: "no-store" }),
    );
  });
});
