"use server";

import type { PaymentFilters, PaymentListResult } from "@/domain/payments/payment";
import { getPayments } from "@/application/payments/get-payments";
import { apiPaymentRepository } from "@/infrastructure/repositories/api-payment-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { PaymentError } from "@/domain/payments/payment-error";
import { translations } from "@/infrastructure/i18n/translations";

export type GetPaymentsActionResult =
  | { success: true; data: PaymentListResult }
  | { success: false; error: string; isForbidden?: boolean };

async function resolveAuthToken(): Promise<string> {
  try {
    return await authSession.getAccessToken();
  } catch {
    if (process.env.APP_ENV === "production") {
      throw new Error("unauthenticated");
    }
    return "mock-token";
  }
}

export async function getPaymentsAction(
  filters?: PaymentFilters,
): Promise<GetPaymentsActionResult> {
  try {
    const token = await resolveAuthToken();
    const result = await getPayments(apiPaymentRepository, token, filters);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof PaymentError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: translations.payments.forbidden,
          isForbidden: true,
        };
      }
      return {
        success: false,
        error: translations.payments.error,
      };
    }
    const message =
      error instanceof Error ? error.message : translations.payments.error;
    return { success: false, error: message };
  }
}
