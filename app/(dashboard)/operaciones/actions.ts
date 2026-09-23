"use server";

import type { OperationSummary } from "@/domain/operations/operation-summary";
import type { OperationFilters } from "@/ports/operations/operation-repository";
import { OperationError } from "@/domain/operations/operation-error";
import { getOperations } from "@/application/operations/get-operations";
import { apiOperationRepository } from "@/infrastructure/repositories/api-operation-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetOperationsResult =
  | { success: true; data: OperationSummary[] }
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

export async function getOperationsAction(
  filters?: OperationFilters,
): Promise<GetOperationsResult> {
  try {
    const token = await resolveAuthToken();
    const operations = await getOperations(apiOperationRepository, token, filters);
    return { success: true, data: operations };
  } catch (error: unknown) {
    if (error instanceof OperationError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: translations.operations.forbidden,
          isForbidden: true,
        };
      }
      return {
        success: false,
        error: translations.operations.error,
      };
    }
    const message = error instanceof Error ? error.message : translations.operations.error;
    return { success: false, error: message };
  }
}
