import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/admin/operations/[id]/images/[fileId]/route";
import { authSession } from "@/infrastructure/auth/auth-session";
vi.mock("@/infrastructure/auth/auth-session", () => ({ authSession: { getAccessToken: vi.fn() } }));
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({
    id: "jr-1",
    fileId: "61f99ae1-a8b8-4591-8a9b-012393e7b54d"
  }) };
describe("private operation image proxy", () => {
  it("rejects malformed object identifiers without requesting upstream data", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const result = await GET(new Request("https://app.example"), { params: Promise.resolve({
        id: "../../private",
        fileId: "unsafe"
      }) });
    expect(result.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects non-image upstream content", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    vi.mocked(authSession.getAccessToken).mockResolvedValue("token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("script", { headers: { "Content-Type": "text/html" } })));
    expect((await GET(new Request("https://app.example"), context)).status).toBe(502);
  });
  it("requires a session before retrieving private bytes", async () => {
    vi.mocked(authSession.getAccessToken).mockRejectedValue(new Error("unauthenticated"));
    expect((await GET(new Request("https://app.example"), context)).status).toBe(401);
  });
  it("forwards authorization and preserves upstream permission denial", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    vi.mocked(authSession.getAccessToken).mockResolvedValue("token");
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 403 }));
    vi.stubGlobal("fetch", fetcher);
    expect((await GET(new Request("https://app.example"), context)).status).toBe(403);
    expect(fetcher).toHaveBeenCalledWith("https://api.example/admin/operations/jr-1/images/61f99ae1-a8b8-4591-8a9b-012393e7b54d", expect.objectContaining({
      headers: { Authorization: "Bearer token" },
      redirect: "error"
    }));
  });
  it("streams only image content with private no-store headers", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    vi.mocked(authSession.getAccessToken).mockResolvedValue("token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("bytes", { headers: { "Content-Type": "image/png" } })));
    const result = await GET(new Request("https://app.example"), context);
    expect(result.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await result.text()).toBe("bytes");
  });
});
