import type { AuditFilters, AuditLogsPage } from "@/domain/audit/audit-log";
import { AuditError } from "@/domain/audit/audit-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapAuditLogsPage } from "./audit-mapper";
import { toAuditDateBoundary } from "./audit-date-boundary";

function hasCursor(endpoint: string, cursor: string): boolean {
  const query = endpoint.split("?")[1];
  return query ? new URLSearchParams(query).get("cursor") === cursor : false;
}

function isAuditLogsEndpoint(endpoint: string): boolean {
  return endpoint === "/admin/audit-logs" ||
    endpoint === "/audit-logs" ||
    endpoint.startsWith("/admin/audit-logs?") ||
    endpoint.startsWith("/audit-logs?");
}

export async function getE2EAuditLogsStub(
  cursor?: string,
): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    const auditStubs = stubs.filter(
      (stub) => stub.method === "GET" && isAuditLogsEndpoint(stub.endpoint),
    );

    if (cursor) {
      return auditStubs.find((stub) => hasCursor(stub.endpoint, cursor)) ?? null;
    }

    return auditStubs.find((stub) => {
      const query = stub.endpoint.split("?")[1];
      return !query || !new URLSearchParams(query).has("cursor");
    }) ?? null;
  } catch {
    return null;
  }
}

function occurredOnOrAfter(value: string, from: string): boolean {
  const instant = new Date(value).getTime();
  const boundary = new Date(toAuditDateBoundary(from) ?? "").getTime();
  return !Number.isNaN(instant) && !Number.isNaN(boundary) && instant >= boundary;
}

function occurredBeforeFollowingDay(value: string, to: string): boolean {
  const instant = new Date(value).getTime();
  const boundary = new Date(toAuditDateBoundary(to, true) ?? "");
  if (Number.isNaN(instant) || Number.isNaN(boundary.getTime())) return false;
  return instant < boundary.getTime();
}

function filterAuditPage(page: AuditLogsPage, filters?: AuditFilters): AuditLogsPage {
  let events = [...page.events];
  if (filters?.action) {
    events = events.filter((entry) => entry.action === filters.action);
  }
  if (filters?.operatorId) {
    events = events.filter((entry) => entry.operatorId === filters.operatorId);
  }
  if (filters?.from) {
    events = events.filter((entry) => occurredOnOrAfter(entry.occurredOn, filters.from!));
  }
  if (filters?.to) {
    events = events.filter((entry) => occurredBeforeFollowingDay(entry.occurredOn, filters.to!));
  }
  return { events, nextCursor: page.nextCursor };
}

export async function resolveAuditLogsFromStub(
  stub: ApiStub,
  filters?: AuditFilters,
): Promise<AuditLogsPage> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new AuditError("forbidden", "Forbidden");
  if (stub.status >= 500) throw new AuditError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new AuditError("unknown", `Failed: ${stub.status}`);

  return filterAuditPage(mapAuditLogsPage(stub.body), filters);
}
