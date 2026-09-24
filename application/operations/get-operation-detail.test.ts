import { describe, expect, it, vi } from "vitest";
import type { OperationRepository } from "@/ports/operations/operation-repository";
import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import { OperationError } from "@/domain/operations/operation-error";
import { getOperationDetail } from "./get-operation-detail";

describe("getOperationDetail use case", () => {
  const mockDetail: UnifiedOperationDetail = {
    id: "op-101",
    status: "in_progress",
    createdAt: "2026-09-18T10:00:00Z",
    category: { id: 1, name: "Plomería" },
    consumer: {
      id: 10,
      name: "Ana",
      surname: "Martínez",
      email: "ana@example.com",
      profilePhotoUrl: null,
    },
    provider: {
      id: 20,
      name: "Carlos",
      surname: "López",
      email: "carlos@example.com",
      profilePhotoUrl: null,
    },
    currentAddress: "Av. Corrientes 1234, CABA",
    request: {
      id: 501,
      title: "Reparación de cañería",
      description: "Pérdida en cocina",
      status: "in_progress",
      photos: [],
    },
    proposals: [],
    order: null,
    timeline: [],
  };

  it("delegates to OperationRepository.getOperationById and returns detail", async () => {
    const mockRepo: OperationRepository = {
      getOperations: vi.fn(),
      getOperationById: vi.fn().mockResolvedValue(mockDetail),
      getAuditedConversation: vi.fn(),
    };

    const result = await getOperationDetail(mockRepo, "test-token", "op-101");

    expect(mockRepo.getOperationById).toHaveBeenCalledWith("test-token", "op-101");
    expect(result).toEqual(mockDetail);
  });

  it("propagates repository errors", async () => {
    const mockRepo: OperationRepository = {
      getOperations: vi.fn(),
      getOperationById: vi.fn().mockRejectedValue(new OperationError("not_found", "Not found")),
      getAuditedConversation: vi.fn(),
    };

    await expect(getOperationDetail(mockRepo, "test-token", "op-999")).rejects.toSatisfy(
      (err) => err instanceof OperationError && err.code === "not_found",
    );
  });
});
