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
  return mapPaymentList(stub.body);
}

function buildApiUrl(baseUrl: string, filters?: PaymentFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/payments`);
  if (filters?.query) url.searchParams.set("query", filters.query);
  if (filters?.purpose) url.searchParams.set("purpose", filters.purpose);
  if (filters?.status) url.searchParams.set("status", filters.status);
  if (filters?.page) url.searchParams.set("page", String(filters.page));
  if (filters?.limit) url.searchParams.set("limit", String(filters.limit));
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
      return resolvePaymentsFromStub(stub);
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
