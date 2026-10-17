import { describe, expect, it, vi } from "vitest";
import { getPayments, GetPaymentsUseCase } from "./get-payments";
import type { PaymentRepository } from "@/ports/payments/payment-repository";
import type { PaymentListResult } from "@/domain/payments/payment";

describe("getPayments use case", () => {
  const mockResult: PaymentListResult = {
    items: [],
    page: { limit: 20, nextCursor: null },
  };

  it("delegates call to repository via getPayments function", async () => {
    const repository: PaymentRepository = {
      getPayments: vi.fn().mockResolvedValue(mockResult),
    };

    const filters = { paymentIntentId: "0f8fad5b-d9cb-469f-a165-70867728950e" };
    const result = await getPayments(repository, "token-123", filters);

    expect(repository.getPayments).toHaveBeenCalledWith("token-123", filters);
    expect(result).toBe(mockResult);
  });

  it("delegates call to repository via GetPaymentsUseCase instance", async () => {
    const repository: PaymentRepository = {
      getPayments: vi.fn().mockResolvedValue(mockResult),
    };

    const useCase = new GetPaymentsUseCase(repository);
    const result = await useCase.execute("token-123", { purpose: "booking_deposit" });

    expect(repository.getPayments).toHaveBeenCalledWith("token-123", { purpose: "booking_deposit" });
    expect(result).toBe(mockResult);
  });

  it("propagates repository errors without swallowing them", async () => {
    const repository: PaymentRepository = {
      getPayments: vi.fn().mockRejectedValue(new Error("Network failure")),
    };

    await expect(getPayments(repository, "token-123")).rejects.toThrow("Network failure");
  });
});
