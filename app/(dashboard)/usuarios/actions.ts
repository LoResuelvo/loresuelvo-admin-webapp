"use server";

import type { Consumer } from "@/domain/users/consumer";
import type { Provider } from "@/domain/users/provider";
import type { ProviderFilters } from "@/ports/users/user-repository";
import { UserError } from "@/domain/users/user-error";
import { getConsumers } from "@/application/users/get-consumers";
import { getProviders } from "@/application/users/get-providers";
import { apiUserRepository } from "@/infrastructure/repositories/api-user-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetConsumersResult =
  | { success: true; data: Consumer[] }
  | { success: false; error: string; isForbidden?: boolean };

export type GetProvidersResult =
  | { success: true; data: Provider[] }
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

export async function getConsumersAction(q?: string): Promise<GetConsumersResult> {
  try {
    const token = await resolveAuthToken();
    const consumers = await getConsumers(apiUserRepository, token, q);
    return { success: true, data: consumers };
  } catch (error: unknown) {
    if (error instanceof UserError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: translations.users.forbidden,
          isForbidden: true,
        };
      }
      return {
        success: false,
        error: translations.users.error,
      };
    }
    const message = error instanceof Error ? error.message : translations.users.error;
    return { success: false, error: message };
  }
}

export async function getProvidersAction(filters?: ProviderFilters): Promise<GetProvidersResult> {
  try {
    const token = await resolveAuthToken();
    const providers = await getProviders(apiUserRepository, token, filters);
    return { success: true, data: providers };
  } catch (error: unknown) {
    if (error instanceof UserError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: translations.users.providers.forbidden,
          isForbidden: true,
        };
      }
      return {
        success: false,
        error: translations.users.providers.error,
      };
    }
    const message = error instanceof Error ? error.message : translations.users.providers.error;
    return { success: false, error: message };
  }
}

