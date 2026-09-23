import { describe, expect, it } from "vitest";
import { mapConsumer, mapConsumers, mapProvider, mapProviders } from "./user-mapper";

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

  const validProviderDto = {
    id: 1,
    role: "provider",
    name: "Juan",
    surname: "Gómez",
    email: "juan@example.com",
    profile_photo_url: "https://example.com/photos/juan.jpg",
    created_on: "2026-09-10",
    category: { id: 10, name: "Plomería" },
    coverage_zones: [
      { id: 1, name: "Comuna 6", code: "comuna_6" },
      { id: 2, name: "Comuna 14", code: "comuna_14" },
    ],
    identity_verification_status: "approved" as const,
    identity_verified_on: "2026-09-11T10:00:00Z",
    auth0_id: "auth0|provider123",
    password_hash: "hash123",
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

  describe("mapProvider", () => {
    it("transforms snake_case DTO to camelCase domain Provider and strips sensitive fields", () => {
      const provider = mapProvider(validProviderDto);

      expect(provider).toEqual({
        id: 1,
        name: "Juan",
        surname: "Gómez",
        email: "juan@example.com",
        profilePhotoUrl: "https://example.com/photos/juan.jpg",
        createdOn: "2026-09-10",
        category: { id: 10, name: "Plomería" },
        coverageZones: [
          { id: 1, name: "Comuna 6", code: "comuna_6" },
          { id: 2, name: "Comuna 14", code: "comuna_14" },
        ],
        identityVerificationStatus: "approved",
        identityVerifiedOn: "2026-09-11T10:00:00Z",
      });
      expect(provider).not.toHaveProperty("auth0_id");
      expect(provider).not.toHaveProperty("password_hash");
    });

    it("handles nullish optional fields gracefully", () => {
      const provider = mapProvider({
        id: 2,
        name: "Laura",
        surname: "Díaz",
        email: "laura@example.com",
        created_on: "2026-09-12",
        category: { id: 11, name: "Electricidad" },
        coverage_zones: [],
        identity_verification_status: "in_review",
      });

      expect(provider.profilePhotoUrl).toBeUndefined();
      expect(provider.identityVerifiedOn).toBeUndefined();
    });

    it("throws error on invalid provider data", () => {
      expect(() => mapProvider({ id: "invalid" })).toThrow("Invalid provider data");
    });
  });

  describe("mapProviders", () => {
    it("transforms array of DTOs into domain Provider array", () => {
      const providers = mapProviders([
        validProviderDto,
        {
          id: 2,
          name: "Laura",
          surname: "Díaz",
          email: "laura@example.com",
          created_on: "2026-09-12",
          category: { id: 11, name: "Electricidad" },
          coverage_zones: [],
          identity_verification_status: "in_review",
        },
      ]);

      expect(providers).toHaveLength(2);
      expect(providers[0].id).toBe(1);
      expect(providers[1].id).toBe(2);
      expect(providers[1].category.name).toBe("Electricidad");
    });

    it("throws error on invalid providers list data", () => {
      expect(() => mapProviders("not-an-array")).toThrow("Invalid providers list data");
    });
  });
});

