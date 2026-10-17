import "server-only";
import type { PaymentFilters, PaymentListResult } from "@/domain/payments/payment";
import { PaymentError } from "@/domain/payments/payment-error";
import type { PaymentRepository } from "@/ports/payments/payment-repository";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapPaymentList } from "./mappers/payment-mapper";

async function getE2EPaymentsStub(): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint.startsWith("/admin/payments") || s.endpoint.startsWith("/payments")),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function resolvePaymentsFromStub(
  stub: ApiStub,
  filters?: PaymentFilters,
): Promise<PaymentListResult> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new PaymentError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new PaymentError("unavailable", `Failed to fetch payments: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new Error(`Failed to fetch payments: ${stub.status}`);
  }
  const result = mapPaymentList(stub.body);
  if (!filters) return result;

  const items = result.items.filter((item) => {
    if (filters.paymentIntentId && item.id !== filters.paymentIntentId) return false;
    if (filters.externalPaymentId && !item.transactions.some(
      (transaction) => transaction.externalPaymentId === filters.externalPaymentId,
    )) return false;
    if (filters.serviceProposalId && item.serviceProposalId !== filters.serviceProposalId) return false;
    if (filters.purpose && item.purpose !== filters.purpose) return false;
    if (filters.intentStatus && item.status !== filters.intentStatus) return false;
    if (filters.createdFrom && Date.parse(item.createdOn) < Date.parse(filters.createdFrom)) return false;
    if (filters.createdTo && Date.parse(item.createdOn) > Date.parse(filters.createdTo)) return false;
    return true;
  });

  return { ...result, items, page: { ...result.page, nextCursor: null } };
}

function buildApiUrl(baseUrl: string, filters?: PaymentFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/payments`);
  const queryParameters: Array<[string, string | number | undefined]> = [
    ["payment_intent_id", filters?.paymentIntentId],
    ["external_reference", filters?.externalReference],
    ["external_payment_id", filters?.externalPaymentId],
    ["service_proposal_id", filters?.serviceProposalId],
    ["consumer_email", filters?.consumerEmail],
    ["provider_email", filters?.providerEmail],
    ["purpose", filters?.purpose],
    ["intent_status", filters?.intentStatus],
    ["created_from", filters?.createdFrom],
    ["created_to", filters?.createdTo],
    ["limit", filters?.limit],
    ["cursor", filters?.cursor],
  ];

  for (const [key, value] of queryParameters) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export const apiPaymentRepository: PaymentRepository = {
  async getPayments(
    tokenOrFilters?: string | PaymentFilters,
    maybeFilters?: PaymentFilters,
  ): Promise<PaymentListResult> {
    const filters = typeof tokenOrFilters === "object" ? tokenOrFilters : maybeFilters;
    const token = typeof tokenOrFilters === "string" ? tokenOrFilters : "";

    const stub = await getE2EPaymentsStub();
    if (stub) {
      return resolvePaymentsFromStub(stub, filters);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const url = buildApiUrl(baseUrl, filters);
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 403) {
      throw new PaymentError("forbidden", "Forbidden");
    }
    if (response.status >= 500) {
      throw new PaymentError("unavailable", `Failed to fetch payments: ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.status}`);
    }

    const data = await response.json();
    return mapPaymentList(data);
  },
};
