import { describe, expect, it, vi, beforeEach } from "vitest";
import { getAuditedConversationAction } from "@/app/(dashboard)/operaciones/actions";
import { apiOperationRepository } from "@/infrastructure/repositories/api-operation-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { OperationError } from "@/domain/operations/operation-error";
import { translations } from "@/infrastructure/i18n/translations";

vi.mock("@/infrastructure/repositories/api-operation-repository", () => ({
  apiOperationRepository: {
    getOperations: vi.fn(),
    getOperationById: vi.fn(),
    getAuditedConversation: vi.fn(),
  },
}));

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn(),
  },
}));

describe("getAuditedConversationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authSession.getAccessToken).mockResolvedValue("mock-token");
  });

  it("returns conversation result on success", async () => {
    const mockResult = {
      items: [
        {
          id: 1,
          senderId: 10,
          senderRole: "consumer" as const,
          content: "Hola",
          sentAt: "2026-09-18T10:00:00Z",
          attachments: [],
        },
      ],
      total: 1,
    };
    vi.mocked(apiOperationRepository.getAuditedConversation).mockResolvedValue(mockResult);

    const result = await getAuditedConversationAction(
      "jr-101",
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockResult);
    }
  });

  it("forwards the cursor without requiring an audit reason", async () => {
    vi.mocked(apiOperationRepository.getAuditedConversation).mockResolvedValue({
      items: [], total: 0, nextCursor: null,
    });

    await getAuditedConversationAction("jr-101", "signed-cursor");

    expect(apiOperationRepository.getAuditedConversation).toHaveBeenCalledWith(
      "mock-token", "jr-101", "signed-cursor",
    );
  });

  it("translates unexpected repository errors into a visible Spanish message", async () => {
    vi.mocked(apiOperationRepository.getAuditedConversation).mockRejectedValue(
      new Error("Invalid internal conversation response"),
    );

    expect(await getAuditedConversationAction("jr-101")).toEqual({
      success: false,
      error: translations.operations.chat.error,
    });
  });

  it("handles forbidden error gracefully", async () => {
    vi.mocked(apiOperationRepository.getAuditedConversation).mockRejectedValue(
      new OperationError("forbidden", "Forbidden"),
    );

    const result = await getAuditedConversationAction(
      "jr-101",
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.isForbidden).toBe(true);
      expect(result.error).toBe(translations.operations.chat.forbidden);
    }
  });
});
