import "server-only";
import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import { UserError } from "@/domain/users/user-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapProviderDiagnostic } from "./mappers/user-mapper";

async function getE2EProviderDiagnosticStub(id: number | string): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return (
      stubs.find(
        (s) => s.method === "GET" && s.endpoint === `/admin/providers/${id}/diagnostic`,
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function resolveProviderDiagnosticFromStub(stub: ApiStub): Promise<ProviderDiagnostic> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (stub.status === 404) {
    throw new UserError("not_found", "Provider not found");
  }
  if (stub.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch provider diagnostic: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new Error(`Failed to fetch provider diagnostic: ${stub.status}`);
  }
  return mapProviderDiagnostic(stub.body);
}

async function fetchProviderDiagnosticFromApi(
  token: string,
  id: number | string,
): Promise<ProviderDiagnostic> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = `${baseUrl.replace(/\/$/, "")}/admin/providers/${id}/diagnostic`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err: unknown) {
    if (err instanceof UserError) throw err;
    throw new UserError("unavailable", "Network error when fetching provider diagnostic");
  }

  if (response.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (response.status === 404) {
    throw new UserError("not_found", "Provider not found");
  }
  if (response.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch provider diagnostic: ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch provider diagnostic: ${response.status}`);
  }

  const data = await response.json();
  return mapProviderDiagnostic(data);
}

export async function fetchProviderDiagnostic(
  token: string,
  id: number | string,
): Promise<ProviderDiagnostic> {
  const stub = await getE2EProviderDiagnosticStub(id);
  if (stub) {
    return resolveProviderDiagnosticFromStub(stub);
  }
  return fetchProviderDiagnosticFromApi(token, id);
}
