import { describe, expect, it, vi } from "vitest";
import { getPayments, GetPaymentsUseCase } from "./get-payments";
import type { PaymentRepository } from "@/ports/payments/payment-repository";
import type { PaymentListResult } from "@/domain/payments/payment";

describe("getPayments use case", () => {
  const mockResult: PaymentListResult = {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  it("delegates call to repository via getPayments function", async () => {
    const repository: PaymentRepository = {
      getPayments: vi.fn().mockResolvedValue(mockResult),
    };

    const result = await getPayments(repository, "token-123", { query: "ref-1" });

    expect(repository.getPayments).toHaveBeenCalledWith("token-123", { query: "ref-1" });
    expect(result).toBe(mockResult);
  });

  it("delegates call to repository via GetPaymentsUseCase instance", async () => {
    const repository: PaymentRepository = {
      getPayments: vi.fn().mockResolvedValue(mockResult),
    };

    const useCase = new GetPaymentsUseCase(repository);
    const result = await useCase.execute("token-123", { purpose: "deposit" });

    expect(repository.getPayments).toHaveBeenCalledWith("token-123", { purpose: "deposit" });
    expect(result).toBe(mockResult);
  });

  it("propagates repository errors without swallowing them", async () => {
    const repository: PaymentRepository = {
      getPayments: vi.fn().mockRejectedValue(new Error("Network failure")),
    };

    await expect(getPayments(repository, "token-123")).rejects.toThrow("Network failure");
  });
});
