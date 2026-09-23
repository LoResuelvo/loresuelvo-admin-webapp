import { describe, expect, it, vi } from "vitest";
import type { UserRepository } from "@/ports/users/user-repository";
import { UserError } from "@/domain/users/user-error";
import { getConsumers } from "./get-consumers";

describe("getConsumers usecase", () => {
  it("delegates to userRepository and returns consumers", async () => {
    const consumers = [
      {
        id: 1,
        name: "Ana",
        surname: "Pérez",
        email: "ana@example.com",
        createdOn: "2026-09-10",
      },
    ];
    const mockRepo: UserRepository = {
      getConsumers: vi.fn().mockResolvedValue(consumers),
    };

    const result = await getConsumers(mockRepo, "valid-token", "ana");

    expect(mockRepo.getConsumers).toHaveBeenCalledWith("valid-token", "ana");
    expect(result).toEqual(consumers);
  });

  it("propagates repository errors", async () => {
    const mockRepo: UserRepository = {
      getConsumers: vi.fn().mockRejectedValue(new UserError("forbidden", "Forbidden")),
    };

    await expect(getConsumers(mockRepo, "token")).rejects.toSatisfy(
      (err) => err instanceof UserError && err.code === "forbidden",
    );
  });
});
