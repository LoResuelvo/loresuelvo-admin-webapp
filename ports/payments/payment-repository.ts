import type { PaymentFilters, PaymentListResult } from "@/domain/payments/payment";

export interface PaymentRepository {
  getPayments(filters?: PaymentFilters): Promise<PaymentListResult>;
  getPayments(token: string, filters?: PaymentFilters): Promise<PaymentListResult>;
  getPayments(tokenOrFilters?: string | PaymentFilters, filters?: PaymentFilters): Promise<PaymentListResult>;
}
