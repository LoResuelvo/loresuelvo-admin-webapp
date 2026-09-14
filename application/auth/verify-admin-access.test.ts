import { describe, expect, it, vi } from "vitest";
import { verifyAdminAccess } from "./verify-admin-access";

const profile = { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" as const };
describe("verifyAdminAccess", () => {
  it("waits for the session before requesting the profile", async () => {
    let resolve!: (token: string) => void;
    const session = { getAccessToken: () => new Promise<string>(r => { resolve = r; }) };
    const repository = { getProfile: vi.fn().mockResolvedValue(profile) };
    const pending = verifyAdminAccess(session, repository);
    expect(repository.getProfile).not.toHaveBeenCalled();
    resolve("token");
    await expect(pending).resolves.toEqual(profile);
    expect(repository.getProfile).toHaveBeenCalledWith("token");
  });
  it("waits for the profile before granting access", async () => {
    let resolve!: (value: typeof profile) => void;
    const repository = { getProfile: () => new Promise<typeof profile>(r => { resolve = r; }) };
    const pending = verifyAdminAccess({ getAccessToken: async () => "token" }, repository);
    await Promise.resolve();
    resolve(profile);
    await expect(pending).resolves.toEqual(profile);
  });
  it("propagates session failures without requesting a profile", async () => {
    const error = new Error("session unavailable");
    const repository = { getProfile: vi.fn() };
    await expect(verifyAdminAccess({ getAccessToken: async () => { throw error; } }, repository)).rejects.toBe(error);
    expect(repository.getProfile).not.toHaveBeenCalled();
  });
  it.each(["consumer", "provider"] as const)("rejects %s profiles", async role => {
    await expect(verifyAdminAccess({ getAccessToken: async () => "token" }, { getProfile: async () => ({ ...profile, role }) })).rejects.toThrow("forbidden");
  });
});
