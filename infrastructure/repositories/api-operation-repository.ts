import "server-only";
import { hasPendingAdvanceOver24Hours } from "@/domain/operations/operation-filter";
import type { OperationFilters, OperationRepository } from "@/ports/operations/operation-repository";
import type { OperationSummary, OperationPage } from "@/domain/operations/operation-summary";
import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import { OperationError } from "@/domain/operations/operation-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapOperations, mapUnifiedOperationDetail } from "./mappers/operation-mapper";
import { fetchOrResolveAuditedConversation } from "./api-audited-conversation";
function buildOperationsUrl(baseUrl: string, filters: OperationFilters = {}): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/operations`);
  if (filters.categoryId)
    url.searchParams.set("category_id", String(filters.categoryId));
  if (filters.cursor)
    url.searchParams.set("cursor", filters.cursor);
  if (filters.limit)
    url.searchParams.set("limit", String(filters.limit));
  switch (filters.bottleneck) {
    case "stalled": break;
    case "delayed_service":
      url.searchParams.set("alert", "delayed");
      break;
    case "pending_booking_deposit":
      url.searchParams.set("stage", "proposal_pending");
      break;
    case "pending_final_payment":
      url.searchParams.set("stage", "work_order_awaiting_payment");
      break;
    case "scheduled_today": {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit"
      }).formatToParts(new Date());
      const value = (type: string) => parts.find(p => p.type === type)?.value;
      url.searchParams.set("scheduled_date", `${value("year")}-${value("month")}-${value("day")}`);
      break;
    }
  }
  return url;
}

async function getE2EOperationsStub(url: URL): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production")
    return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return parseE2EStubsFromCookies(cookieStore.getAll()).find(s => {
      const stubUrl = new URL(s.endpoint, url.origin);
      return s.method === "GET" && stubUrl.pathname === url.pathname && stubUrl.searchParams.toString() === url.searchParams.toString();
    }) ?? null;
  }
  catch {
    return null;
  }
}

async function fetchOperationsPage(token: string, filters?: OperationFilters): Promise<OperationPage> {
  const url = buildOperationsUrl(process.env.API_URL ?? "http://stub.invalid", filters);
  const stub = await getE2EOperationsStub(url);
  if (stub) {
    if (stub.delayMs)
      await new Promise(resolve => setTimeout(resolve, stub.delayMs));
    if (stub.status >= 400)
      handleOperationDetailHttpError(stub.status);
    return mapOperations(stub.body);
  }
  if (!process.env.API_URL)
    throw new OperationError("unavailable", "API_URL is not configured");
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(10000)
    });
  }
  catch {
    throw new OperationError("unavailable", "Network error when fetching operations");
  }
  if (!response.ok)
    handleOperationDetailHttpError(response.status);
  return mapOperations(await response.json());
}

async function fetchOperations(token: string, filters: OperationFilters = {}): Promise<OperationPage> {
  if (filters.bottleneck === "pending_proposal_24h")
    throw new OperationError("unknown", "Request acceptance timestamp unavailable");
  // Text search is absent from the API. Traverse the complete filtered inbox so
  // matches on later pages remain reachable; never send unsupported q parameters.
  if (!filters.q && filters.bottleneck !== "none" && filters.bottleneck !== "stalled")
    return fetchOperationsPage(token, filters);
  const operations: OperationSummary[] = [];
  const visited = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await fetchOperationsPage(token, { ...filters, cursor });
    operations.push(...page.operations);
    cursor = page.nextCursor ?? undefined;
    if (cursor && visited.has(cursor))
      throw new OperationError("unknown", "Repeated operations cursor");
    if (cursor)
      visited.add(cursor);
  } while (cursor);
  const query = filters.q?.trim().toLocaleLowerCase("es-AR");
  return {
    operations: operations.filter(operation => matchesLocalFilters(operation, filters, query)),
    nextCursor: null,
  };

}

function matchesLocalFilters(operation: OperationSummary, filters: OperationFilters, query?: string): boolean {
  if (filters.bottleneck === "none" && operation.alerts?.length !== 0) return false;
  if (filters.bottleneck === "stalled" && !hasPendingAdvanceOver24Hours(operation, Date.now())) return false;
  if (!query) return true;
  const participants = [operation.consumer, operation.provider];
  return participants.some(party =>
    [party.name, party.surname, `${party.name} ${party.surname}`, String(party.id)]
      .some(value => value.toLocaleLowerCase("es-AR").includes(query)),
  );
}

async function getE2EOperationDetailStub(id: string): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production")
    return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return (stubs.find((s) => s.method === "GET" &&
      (s.endpoint === `/admin/operations/${id}` || s.endpoint === `/operations/${id}`)) ?? null);
  }
  catch {
    return null;
  }
}

async function resolveOperationDetailFromStub(stub: ApiStub): Promise<UnifiedOperationDetail> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 404) {
    throw new OperationError("not_found", "Operation not found");
  }
  if (stub.status === 403) {
    throw new OperationError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new OperationError("unavailable", `Failed to fetch operation detail: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new OperationError("unknown", `Failed to fetch operation detail: ${stub.status}`);
  }
  return mapUnifiedOperationDetail(stub.body);
}

function handleOperationDetailHttpError(status: number): never {
  if (status === 404)
    throw new OperationError("not_found", "Operation not found");
  if (status === 403)
    throw new OperationError("forbidden", "Forbidden");
  if (status >= 500)
    throw new OperationError("unavailable", `Failed to fetch operation detail: ${status}`);
  throw new OperationError("unknown", `Failed to fetch operation detail: ${status}`);
}

async function fetchOperationDetailFromApi(token: string, id: string): Promise<UnifiedOperationDetail> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }
  const url = `${baseUrl.replace(/\/$/, "")}/admin/operations/${encodeURIComponent(id)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  }
  catch (err: unknown) {
    if (err instanceof OperationError)
      throw err;
    throw new OperationError("unavailable", "Network error when fetching operation detail");
  }
  if (!response.ok) {
    handleOperationDetailHttpError(response.status);
  }
  const data = await response.json();
  return mapUnifiedOperationDetail(data);
}
export const apiOperationRepository: OperationRepository = {
  getOperations: fetchOperations,
  async getOperationById(token: string, id: string): Promise<UnifiedOperationDetail> {
    const stub = await getE2EOperationDetailStub(id);
    if (stub) {
      return resolveOperationDetailFromStub(stub);
    }
    return fetchOperationDetailFromApi(token, id);
  },
  getAuditedConversation: fetchOrResolveAuditedConversation,
};
