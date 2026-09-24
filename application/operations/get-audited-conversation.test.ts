import { describe, expect, it, vi } from "vitest";
import { getAuditedConversation } from "./get-audited-conversation";
import type { OperationRepository } from "@/ports/operations/operation-repository";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import { OperationError } from "@/domain/operations/operation-error";

describe("getAuditedConversation", () => {
  const mockResult: AuditedConversationResult = {
    items: [
      {
        id: 1,
        senderId: 10,
        senderRole: "consumer",
        content: "Hola mundo",
        sentAt: "2026-09-18T10:15:00Z",
        attachments: [],
      },
    ],
    total: 1,
  };

  it("delegates to OperationRepository.getAuditedConversation with parameters", async () => {
    const mockRepo: OperationRepository = {
      getOperations: vi.fn(),
      getOperationById: vi.fn(),
      getAuditedConversation: vi.fn().mockResolvedValue(mockResult),
    };

    const result = await getAuditedConversation(
      mockRepo,
      "test-token",
      "op-101",
      "Reclamo de cliente",
    );

    expect(mockRepo.getAuditedConversation).toHaveBeenCalledWith(
      "test-token",
      "op-101",
      "Reclamo de cliente",
    );
    expect(result).toEqual(mockResult);
  });

  it("propagates repository errors", async () => {
    const mockRepo: OperationRepository = {
      getOperations: vi.fn(),
      getOperationById: vi.fn(),
      getAuditedConversation: vi
        .fn()
        .mockRejectedValue(new OperationError("forbidden", "Forbidden")),
    };

    await expect(
      getAuditedConversation(mockRepo, "test-token", "op-101", "Causa"),
    ).rejects.toSatisfy(
      (err) => err instanceof OperationError && err.code === "forbidden",
    );
  });
});
