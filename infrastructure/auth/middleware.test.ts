// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware } from "@/middleware";
import { ROUTES } from "@/lib/routes";
import { translations } from "@/infrastructure/i18n/translations";

const auth = vi.hoisted(() => ({ middleware: vi.fn(), getAuth0: vi.fn() }));
vi.mock("./auth0", () => ({ getAuth0: auth.getAuth0 }));

beforeEach(() => {
  vi.resetAllMocks();
  auth.getAuth0.mockReturnValue({ middleware: auth.middleware });
});

describe("authentication middleware", () => {
  it("delegates the login request and preserves the SDK response", async () => {
    const request = new NextRequest(new URL(ROUTES.signIn, "https://admin.example.com"));
    const redirect = NextResponse.redirect("https://auth.example.com/authorize");
    auth.middleware.mockResolvedValue(redirect);

    expect(await middleware(request)).toBe(redirect);
    expect(auth.middleware).toHaveBeenCalledExactlyOnceWith(request);
  });

  it("returns a safe unavailable response when the SDK fails", async () => {
    auth.middleware.mockRejectedValue(new Error("sensitive SDK detail"));
    const response = await middleware(new NextRequest(new URL(ROUTES.signIn, "https://admin.example.com")));

    expect(response.status).toBe(503);
    expect(await response.text()).toBe(translations.auth.unavailable);
  });

  it("returns a safe unavailable response when configuration is missing", async () => {
    auth.getAuth0.mockImplementation(() => { throw new Error("sensitive configuration detail"); });
    const response = await middleware(new NextRequest(new URL(ROUTES.signIn, "https://admin.example.com")));

    expect(response.status).toBe(503);
    expect(await response.text()).toBe(translations.auth.unavailable);
    expect(auth.middleware).not.toHaveBeenCalled();
  });
});
