import { describe, expect, it, vi } from "vitest";
import type { UserRepository } from "@/ports/users/user-repository";
import { UserError } from "@/domain/users/user-error";
import { getProviders } from "./get-providers";

describe("getProviders usecase", () => {
  const sampleProviders = [
    {
      id: 1,
      name: "Juan",
      surname: "Gómez",
      email: "juan@example.com",
      createdOn: "2026-09-10",
      category: { id: 10, name: "Plomería" },
      coverageZones: [{ id: 1, name: "Comuna 6", code: "comuna_6" }],
      identityVerificationStatus: "approved" as const,
    },
  ];

  it("delegates to userRepository and returns providers", async () => {
    const mockRepo: UserRepository = {
      getConsumers: vi.fn(),
      getProviders: vi.fn().mockResolvedValue(sampleProviders),
      getProviderDiagnostic: vi.fn(),
    };

    const filters = { q: "juan", categoryId: 10 };
    const result = await getProviders(mockRepo, "valid-token", filters);

    expect(mockRepo.getProviders).toHaveBeenCalledWith("valid-token", filters);
    expect(result).toEqual(sampleProviders);
  });

  it("propagates repository errors", async () => {
    const mockRepo: UserRepository = {
      getConsumers: vi.fn(),
      getProviders: vi.fn().mockRejectedValue(new UserError("forbidden", "Forbidden")),
      getProviderDiagnostic: vi.fn(),
    };

    await expect(getProviders(mockRepo, "token")).rejects.toSatisfy(
      (err) => err instanceof UserError && err.code === "forbidden",
    );
  });
});
