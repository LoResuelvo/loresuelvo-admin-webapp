import { describe, expect, it } from "vitest";
import { mapConsumer, mapConsumers } from "./user-mapper";

describe("user-mapper", () => {
  const validConsumerDto = {
    id: 1,
    role: "consumer",
    name: "Ana",
    surname: "Pérez",
    email: "ana@example.com",
    profile_photo_url: "https://example.com/photos/ana.jpg",
    created_on: "2026-09-10",
    auth0_id: "auth0|123456",
    password_hash: "secret_hash",
  };

  describe("mapConsumer", () => {
    it("transforms snake_case DTO to camelCase domain Consumer and strips sensitive fields", () => {
      const consumer = mapConsumer(validConsumerDto);

      expect(consumer).toEqual({
        id: 1,
        name: "Ana",
        surname: "Pérez",
        email: "ana@example.com",
        profilePhotoUrl: "https://example.com/photos/ana.jpg",
        createdOn: "2026-09-10",
      });
      expect(consumer).not.toHaveProperty("auth0_id");
      expect(consumer).not.toHaveProperty("password_hash");
    });

    it("handles nullish profile_photo_url gracefully", () => {
      const consumer = mapConsumer({
        id: 2,
        name: "Beatriz",
        surname: "Suárez",
        email: "beatriz@example.com",
        profile_photo_url: null,
        created_on: "2026-09-12",
      });

      expect(consumer.profilePhotoUrl).toBeUndefined();
    });

    it("throws error on invalid data", () => {
      expect(() => mapConsumer({ id: "invalid" })).toThrow("Invalid consumer data");
    });
  });

  describe("mapConsumers", () => {
    it("transforms array of DTOs into domain Consumer array", () => {
      const consumers = mapConsumers([
        validConsumerDto,
        {
          id: 2,
          name: "Beatriz",
          surname: "Suárez",
          email: "beatriz@example.com",
          created_on: "2026-09-12",
        },
      ]);

      expect(consumers).toHaveLength(2);
      expect(consumers[0].id).toBe(1);
      expect(consumers[1].id).toBe(2);
      expect(consumers[1].name).toBe("Beatriz");
    });

    it("throws error on invalid list data", () => {
      expect(() => mapConsumers("not-an-array")).toThrow("Invalid consumers list data");
    });
  });
});
