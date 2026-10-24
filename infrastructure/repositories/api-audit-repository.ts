import "server-only";
import type { AuditFilters, AuditLogsPage } from "@/domain/audit/audit-log";
import { AuditError } from "@/domain/audit/audit-error";
import type { AuditRepository } from "@/ports/audit/audit-repository";
import { mapAuditLogsPage } from "./audit-mapper";
import { getE2EAuditLogsStub, resolveAuditLogsFromStub } from "./audit-stubs";
import { toAuditDateBoundary } from "./audit-date-boundary";

function buildApiUrl(baseUrl: string, filters?: AuditFilters, cursor?: string): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/audit-logs`);
  if (filters?.action) url.searchParams.set("action", filters.action);
  if (filters?.operatorId) url.searchParams.set("operator_id", String(filters.operatorId));
  if (filters?.from) {
    const occurredFrom = toAuditDateBoundary(filters.from);
    if (occurredFrom) url.searchParams.set("occurred_from", occurredFrom);
  }
  if (filters?.to) {
    const occurredTo = toAuditDateBoundary(filters.to, true);
    if (occurredTo) url.searchParams.set("occurred_to", occurredTo);
  }
  if (cursor) url.searchParams.set("cursor", cursor);
  return url;
}

export const apiAuditRepository: AuditRepository = {
  async getAuditLogs(
    token: string,
    filters?: AuditFilters,
    cursor?: string,
  ): Promise<AuditLogsPage> {
    const stub = await getE2EAuditLogsStub(cursor);
    if (stub) {
      return resolveAuditLogsFromStub(stub, filters);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const url = buildApiUrl(baseUrl, filters, cursor);
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
    return mapAuditLogsPage(data);
  },
};
