import { describe, expect, it, vi } from "vitest";
import type { ConsumerDetail } from "@/domain/users/consumer-history";
import type { UserRepository } from "@/ports/users/user-repository";
import {
  GetConsumerHistoryUseCase,
  getConsumerHistory,
} from "./get-consumer-history";

describe("GetConsumerHistoryUseCase", () => {
  const mockConsumerDetail: ConsumerDetail = {
    id: 301,
    name: "Carlos",
    surname: "López",
    email: "carlos@example.com",
    phone: "+54 11 4444-2222",
    profilePhotoUrl: "https://storage.loresuelvo.internal/profiles/301.jpg",
    registeredAt: "2026-09-01T10:00:00-03:00",
    currentAddress: "Av. Rivadavia 4500",
    coverageZone: { id: 6, name: "Comuna 6" },
    history: [
      {
        resourceId: 105,
        operationId: 105,
        resourceType: "work_order",
        categoryName: "Plomería",
        provider: { id: 201, name: "Juan Gómez" },
        status: "completed",
        totalAmountCents: 2000000,
        createdAt: "2026-09-20T10:00:00-03:00",
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
  };

  const mockRepo: UserRepository = {
    getConsumers: vi.fn(),
    getProviders: vi.fn(),
    getProviderDiagnostic: vi.fn(),
    getConsumerHistory: vi.fn().mockResolvedValue(mockConsumerDetail),
  };

  it("delegates to repository getConsumerHistory via class", async () => {
    const useCase = new GetConsumerHistoryUseCase(mockRepo);
    const result = await useCase.execute("mock-token", 301, { status: "completed" });

    expect(mockRepo.getConsumerHistory).toHaveBeenCalledWith("mock-token", 301, {
      status: "completed",
    });
    expect(result).toEqual(mockConsumerDetail);
  });

  it("delegates to repository getConsumerHistory via helper function", async () => {
    const result = await getConsumerHistory(mockRepo, "mock-token", "301");

    expect(mockRepo.getConsumerHistory).toHaveBeenCalledWith("mock-token", "301", undefined);
    expect(result).toEqual(mockConsumerDetail);
  });
});
