import type { AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";
import { AuditError } from "@/domain/audit/audit-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapAuditLogsList } from "./audit-mapper";

export async function getE2EAuditLogsStub(filters?: AuditFilters): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());

    if (filters?.action) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          s.endpoint.includes(`action=${encodeURIComponent(filters.action!)}`),
      );
      if (match) return match;
    }

    if (filters?.operator) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          s.endpoint.includes(`operator=${encodeURIComponent(filters.operator!)}`),
      );
      if (match) return match;
    }

    if (filters?.from) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          s.endpoint.includes(`from=${encodeURIComponent(filters.from!)}`),
      );
      if (match) return match;
    }

    if (filters?.to) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          s.endpoint.includes(`to=${encodeURIComponent(filters.to!)}`),
      );
      if (match) return match;
    }

    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === "/admin/audit-logs" ||
            s.endpoint === "/audit-logs" ||
            s.endpoint.startsWith("/admin/audit-logs?") ||
            s.endpoint.startsWith("/audit-logs?")),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export async function resolveAuditLogsFromStub(
  stub: ApiStub,
  filters?: AuditFilters,
): Promise<AuditLogEntry[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new AuditError("forbidden", "Forbidden");
  if (stub.status >= 500) throw new AuditError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new AuditError("unknown", `Failed: ${stub.status}`);

  let result = mapAuditLogsList(stub.body);
  if (filters?.action) {
    result = result.filter((entry) => entry.action === filters.action);
  }
  if (filters?.operator) {
    const op = filters.operator.toLowerCase().trim();
    result = result.filter(
      (entry) =>
        entry.operatorEmail.toLowerCase().includes(op) ||
        entry.operatorId.toLowerCase().includes(op),
    );
  }
  if (filters?.from) {
    const fromDateStr = filters.from.includes("T") ? filters.from : `${filters.from}T00:00:00.000Z`;
    const fromTime = new Date(fromDateStr).getTime();
    if (!isNaN(fromTime)) {
      result = result.filter((entry) => new Date(entry.timestamp).getTime() >= fromTime);
    } else {
      result = result.filter((entry) => entry.timestamp.slice(0, 10) >= filters.from!);
    }
  }
  if (filters?.to) {
    const toDateStr = filters.to.includes("T") ? filters.to : `${filters.to}T23:59:59.999Z`;
    const toTime = new Date(toDateStr).getTime();
    if (!isNaN(toTime)) {
      result = result.filter((entry) => new Date(entry.timestamp).getTime() <= toTime);
    } else {
      result = result.filter((entry) => entry.timestamp.slice(0, 10) <= filters.to!);
    }
  }
  return result;
}
