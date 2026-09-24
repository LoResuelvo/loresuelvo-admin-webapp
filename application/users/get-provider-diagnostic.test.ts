import { describe, expect, it, vi } from "vitest";
import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import type { UserRepository } from "@/ports/users/user-repository";
import {
  GetProviderDiagnosticUseCase,
  getProviderDiagnostic,
} from "./get-provider-diagnostic";

describe("GetProviderDiagnosticUseCase", () => {
  const mockDiagnostic: ProviderDiagnostic = {
    id: 201,
    name: "Juan",
    surname: "Gómez",
    email: "juan@example.com",
    phone: "+54 11 5555-0101",
    category: { id: 2, name: "Plomería" },
    coverageZones: [{ id: 6, name: "Comuna 6", isActive: true }],
    identityVerification: { status: "approved" },
    paymentConnection: { isConnected: true, canReceivePayments: true },
    calendarConnection: { status: "connected" },
  };

  const mockRepo: UserRepository = {
    getConsumers: vi.fn(),
    getProviders: vi.fn(),
    getProviderDiagnostic: vi.fn().mockResolvedValue(mockDiagnostic),
    getConsumerHistory: vi.fn(),
  };

  it("delegates to repository getProviderDiagnostic via class", async () => {
    const useCase = new GetProviderDiagnosticUseCase(mockRepo);
    const result = await useCase.execute("mock-token", 201);

    expect(mockRepo.getProviderDiagnostic).toHaveBeenCalledWith("mock-token", 201);
    expect(result).toEqual(mockDiagnostic);
  });

  it("delegates to repository getProviderDiagnostic via helper function", async () => {
    const result = await getProviderDiagnostic(mockRepo, "mock-token", "201");

    expect(mockRepo.getProviderDiagnostic).toHaveBeenCalledWith("mock-token", "201");
    expect(result).toEqual(mockDiagnostic);
  });
});
