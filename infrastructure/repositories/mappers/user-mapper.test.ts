import { providerDiagnosticFixture } from "../../../features/users/provider_diagnostic_fixture";
import { describe, expect, it } from "vitest";
import { mapProviderDiagnostic, mapConsumerDetail } from "./user-mapper";

describe("mapProviderDiagnostic", () => {
  it("maps the current nested API response without inventing contact or totals", () => {
    const result = mapProviderDiagnostic(providerDiagnosticFixture);
    expect(result).toMatchObject({ id: 201, name: "Juan", category: { id: 2, name: "Plomería" } });
    expect(result.coverageZones).toEqual([{ id: 6, name: "Comuna 6", isActive: true }, { id: 14, name: "Comuna 14", isActive: false }]);
    expect(result.phone).toBeUndefined();
    expect(result.paymentConnection).toEqual({ isConnected: true, canReceivePayments: null });
    expect(result.activitySummary?.totalRequests).toBeUndefined();
    expect(result.activitySummary?.recentOperations[0]).toMatchObject({ id: 105, resourceType: "work_order", operationsHref: "/operaciones?provider_id=201" });
    expect(result.activitySummary?.averageRating).toBe(4.8);
  });

  it("preserves absent verification evidence and disconnected payment state", () => {
    const result = mapProviderDiagnostic({ ...providerDiagnosticFixture,
      provider: { ...providerDiagnosticFixture.provider, profile_photo_url: null, identity_verified_on: null },
      payment: { state: "disconnected", token_expires_on: null },
    });
    expect(result.profilePhotoUrl).toBeUndefined();
    expect(result.identityVerification.verifiedAt).toBeUndefined();
    expect(result.paymentConnection).toEqual({ isConnected: false, canReceivePayments: null });
  });

  it("rejects malformed or obsolete contracts", () => {
    expect(() => mapProviderDiagnostic({})).toThrow("Invalid provider diagnostic data");
    expect(() => mapProviderDiagnostic(null)).toThrow("Invalid provider diagnostic data");
    expect(() => mapProviderDiagnostic({ id: 201, payment_connection: {} })).toThrow("Invalid provider diagnostic data");
  });
});

describe("mapConsumerDetail", () => {
  const validConsumerDto = {
    consumer: {
      id: 301,
      role: "consumer",
      name: "Carlos",
      surname: "López",
      email: "carlos@example.com",
      profile_photo_url: "https://storage.loresuelvo.internal/profiles/301.jpg",
      created_on: "2026-09-01T10:00:00-03:00",
      address: {
        street: "Av. Rivadavia",
        street_number: "4500",
        floor: null,
        unit: null,
        source: "current_consumer_profile",
      },
      coverage_zone: {
        id: 6,
        name: "Comuna 6",
        enabled: true,
        source: "current_consumer_profile",
      },
    },
    summary: { job_requests: 3, service_proposals: 2, work_orders: 4 },
    page: {
      items: [
        {
          type: "work_order",
          id: 105,
          status: "paid",
          provider: { id: 201, name: "Juan", surname: "Gómez" },
          occurred_on: "2026-09-20T10:00:00-03:00",
          operation: {
            id: "jr-105",
            url: "/admin/operations/jr-105",
            required_permission: "read:admin_operations",
            chat_required_permission: "read:admin_chat_audit",
          },
          job_request_id: 5,
          service_proposal_id: 17,
          accepted_on: "2026-09-19T10:00:00-03:00",
          completion_reported_on: "2026-09-20T10:00:00-03:00",
          balance_paid_on: "2026-09-20T10:01:00-03:00",
        },
      ],
      limit: 20,
      next_cursor: "signed-next-page",
    },
  };

  it("maps valid DTO to domain ConsumerDetail entity", () => {
    const result = mapConsumerDetail(validConsumerDto);

    expect(result.id).toBe(301);
    expect(result.name).toBe("Carlos");
    expect(result.surname).toBe("López");
    expect(result.email).toBe("carlos@example.com");
    expect(result.phone).toBeUndefined();
    expect(result.profilePhotoUrl).toBe(
      "https://storage.loresuelvo.internal/profiles/301.jpg",
    );
    expect(result.registeredAt).toBe("2026-09-01T10:00:00-03:00");
    expect(result.currentAddress).toBe("Av. Rivadavia 4500");
    expect(result.coverageZone).toEqual({ id: 6, name: "Comuna 6" });
    expect(result.history).toHaveLength(1);
    expect(result.history[0]).toEqual({
      resourceId: 105,
      operationId: "jr-105",
      resourceType: "work_order",
      provider: {
        id: 201,
        name: "Juan Gómez",
      },
      status: "paid",
      createdAt: "2026-09-20T10:00:00-03:00",
    });
    expect(result.pagination).toEqual({
      limit: 20,
      hasMore: true,
      nextCursor: "signed-next-page",
    });
  });

  it("handles missing optional profile data and exhausted pages", () => {
    const dtoWithoutOptionalData = {
      ...validConsumerDto,
      consumer: {
        ...validConsumerDto.consumer,
        profile_photo_url: null,
        address: null,
        coverage_zone: null,
      },
      page: { ...validConsumerDto.page, next_cursor: null },
    };

    const result = mapConsumerDetail(dtoWithoutOptionalData);
    expect(result.profilePhotoUrl).toBeUndefined();
    expect(result.phone).toBeUndefined();
    expect(result.currentAddress).toBeUndefined();
    expect(result.coverageZone).toBeUndefined();
    expect(result.pagination.hasMore).toBe(false);
    expect(result.pagination.nextCursor).toBeUndefined();
  });

  it("throws an error for invalid data", () => {
    expect(() => mapConsumerDetail({})).toThrow("Invalid consumer history data");
    expect(() => mapConsumerDetail(null)).toThrow("Invalid consumer history data");
  });
});
