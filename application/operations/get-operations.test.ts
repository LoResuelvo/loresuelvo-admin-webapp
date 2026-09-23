import { describe, expect, it, vi } from "vitest";
import type { OperationRepository } from "@/ports/operations/operation-repository";
import { OperationError } from "@/domain/operations/operation-error";
import { getOperations } from "./get-operations";

describe("getOperations use case", () => {
  it("delegates to OperationRepository and returns operations", async () => {
    const mockOperations = [
      {
        id: "op-1",
        consumer: { id: 1, name: "Juan", surname: "Pérez", email: "juan@example.com" },
        provider: { id: 2, name: "Carlos", surname: "López", email: "carlos@example.com" },
        category: { id: 1, name: "Plomería" },
        status: "in_progress" as const,
        bottleneck: "stalled" as const,
        nextActionBy: "provider" as const,
        createdAt: "2026-09-18T10:00:00Z",
        updatedAt: "2026-09-20T14:30:00Z",
      },
    ];

    const mockRepo: OperationRepository = {
      getOperations: vi.fn().mockResolvedValue(mockOperations),
      getOperationById: vi.fn(),
    };

    const filters = { bottleneck: "stalled" as const };
    const result = await getOperations(mockRepo, "test-token", filters);

    expect(mockRepo.getOperations).toHaveBeenCalledWith("test-token", filters);
    expect(result).toEqual(mockOperations);
  });

  it("propagates repository errors", async () => {
    const mockRepo: OperationRepository = {
      getOperations: vi.fn().mockRejectedValue(new OperationError("forbidden", "Forbidden")),
      getOperationById: vi.fn(),
    };

    await expect(getOperations(mockRepo, "test-token")).rejects.toSatisfy(
      (err) => err instanceof OperationError && err.code === "forbidden",
    );
  });
});
