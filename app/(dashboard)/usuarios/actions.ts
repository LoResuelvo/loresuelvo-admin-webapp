"use server";

import type { Consumer } from "@/domain/users/consumer";
import { UserError } from "@/domain/users/user-error";
import { getConsumers } from "@/application/users/get-consumers";
import { apiUserRepository } from "@/infrastructure/repositories/api-user-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetConsumersResult =
  | { success: true; data: Consumer[] }
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
