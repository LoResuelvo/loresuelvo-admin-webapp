import "server-only";
import type { UserRepository } from "@/ports/users/user-repository";
import type { Consumer } from "@/domain/users/consumer";
import { UserError } from "@/domain/users/user-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapConsumers } from "./user-mapper";

async function getE2EStub(q?: string) {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    if (q) {
      const exact = stubs.find(
        (s) => s.method === "GET" && s.endpoint === `/admin/consumers?q=${encodeURIComponent(q)}`,
      );
      if (exact) return exact;
    }
    return stubs.find((s) => s.method === "GET" && s.endpoint === "/admin/consumers") ?? null;
  } catch {
    return null;
  }
}

async function resolveFromStub(stub: ApiStub, q?: string): Promise<Consumer[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch consumers: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new Error(`Failed to fetch consumers: ${stub.status}`);
  }
  let result = mapConsumers(stub.body);
  if (q && stub.endpoint === "/admin/consumers") {
    const query = q.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.surname.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query),
    );
  }
  return result;
}

async function fetchConsumersFromApi(token: string, q?: string): Promise<Consumer[]> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/consumers`);
  if (q) {
    url.searchParams.set("q", q);
  }

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
    if (err instanceof UserError) throw err;
    throw new UserError("unavailable", "Network error when fetching consumers");
  }

  if (response.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (response.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch consumers: ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch consumers: ${response.status}`);
  }

  const data = await response.json();
  return mapConsumers(data);
}

export const apiUserRepository: UserRepository = {
  async getConsumers(token: string, q?: string): Promise<Consumer[]> {
    const stub = await getE2EStub(q);
    if (stub) {
      return resolveFromStub(stub, q);
    }
    return fetchConsumersFromApi(token, q);
  },
};
