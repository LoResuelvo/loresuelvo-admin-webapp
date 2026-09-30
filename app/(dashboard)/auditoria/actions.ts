"use server";

import type { AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";
import { AuditError } from "@/domain/audit/audit-error";
import { getAuditLogs } from "@/application/audit/get-audit-logs";
import { apiAuditRepository } from "@/infrastructure/repositories/api-audit-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetAuditLogsResult =
  | { success: true; data: AuditLogEntry[] }
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

export async function getAuditLogsAction(
  filters?: AuditFilters,
): Promise<GetAuditLogsResult> {
  const copy = translations.audit;
  try {
    const token = await resolveAuthToken();
    const data = await getAuditLogs(apiAuditRepository, token, filters);
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof AuditError && error.code === "forbidden") {
      return {
        success: false,
        error: copy.forbidden,
        isForbidden: true,
      };
    }
    return { success: false, error: copy.error };
  }
}
