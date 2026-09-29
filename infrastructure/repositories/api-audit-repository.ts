import "server-only";
import type { AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";
import { AuditError } from "@/domain/audit/audit-error";
import type { AuditRepository } from "@/ports/audit/audit-repository";
import { mapAuditLogsList } from "./audit-mapper";
import { getE2EAuditLogsStub, resolveAuditLogsFromStub } from "./audit-stubs";

function buildApiUrl(baseUrl: string, filters?: AuditFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/audit-logs`);
  if (filters?.action) url.searchParams.set("action", filters.action);
  if (filters?.operator) url.searchParams.set("operator", filters.operator);
  if (filters?.from) url.searchParams.set("from", filters.from);
  if (filters?.to) url.searchParams.set("to", filters.to);
  return url;
}

export const apiAuditRepository: AuditRepository = {
  async getAuditLogs(token: string, filters?: AuditFilters): Promise<AuditLogEntry[]> {
    const stub = await getE2EAuditLogsStub(filters);
    if (stub) {
      return resolveAuditLogsFromStub(stub, filters);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const url = buildApiUrl(baseUrl, filters);
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err: unknown) {
      if (err instanceof AuditError) throw err;
      throw new AuditError("unavailable", "Network error when fetching audit logs");
    }

    if (response.status === 403) throw new AuditError("forbidden", "Forbidden");
    if (response.status >= 500) throw new AuditError("unavailable", `Failed: ${response.status}`);
    if (!response.ok) throw new AuditError("unknown", `Failed: ${response.status}`);

    const data = await response.json();
    return mapAuditLogsList(data);
  },
};
