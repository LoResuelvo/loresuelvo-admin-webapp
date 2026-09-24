import type { PaymentFilters, PaymentListResult } from "@/domain/payments/payment";
import type { PaymentRepository } from "@/ports/payments/payment-repository";

export async function getPayments(
  repository: PaymentRepository,
  token?: string,
  filters?: PaymentFilters,
): Promise<PaymentListResult> {
  return repository.getPayments(token, filters);
}

export class GetPaymentsUseCase {
  constructor(private readonly repository: PaymentRepository) {}

  async execute(token?: string, filters?: PaymentFilters): Promise<PaymentListResult> {
    return this.repository.getPayments(token, filters);
  }
}
