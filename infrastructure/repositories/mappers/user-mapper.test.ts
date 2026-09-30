import { describe, expect, it } from "vitest";
import { mapProviderDiagnostic, mapConsumerDetail } from "./user-mapper";

describe("mapProviderDiagnostic", () => {
  const validDto = {
    id: 201,
    name: "Juan",
    surname: "Gómez",
    email: "juan@example.com",
    phone: "+54 11 5555-0101",
    profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
    category: { id: 2, name: "Plomería" },
    coverage_zones: [
      { id: 6, name: "Comuna 6", is_active: true },
      { id: 14, name: "Comuna 14", is_active: false },
    ],
    identity_verification: {
      status: "approved",
      verified_at: "2026-09-15T12:00:00-03:00",
    },
    payment_connection: {
      is_connected: true,
      account_id: "mp-acc-8812",
      can_receive_payments: true,
    },
    calendar_connection: {
      status: "connected",
    },
    activity_summary: {
      total_requests: 14,
      active_orders: 2,
      completed_orders: 10,
      average_rating: 4.8,
      reviews_count: 9,
      recent_operations: [
        {
          id: 105,
          category_name: "Plomería",
          consumer_name: "Carlos López",
          status: "in_progress",
          created_at: "2026-09-21T09:30:00-03:00",
        },
      ],
    },
  };

  it("maps valid DTO to domain ProviderDiagnostic entity", () => {
    const result = mapProviderDiagnostic(validDto);

    expect(result.id).toBe(201);
    expect(result.name).toBe("Juan");
    expect(result.surname).toBe("Gómez");
    expect(result.email).toBe("juan@example.com");
    expect(result.phone).toBe("+54 11 5555-0101");
    expect(result.profilePhotoUrl).toBe(
      "https://storage.loresuelvo.internal/profiles/201.jpg",
    );
    expect(result.category).toEqual({ id: 2, name: "Plomería" });
    expect(result.coverageZones).toEqual([
      { id: 6, name: "Comuna 6", isActive: true },
      { id: 14, name: "Comuna 14", isActive: false },
    ]);
    expect(result.identityVerification).toEqual({
      status: "approved",
      verifiedAt: "2026-09-15T12:00:00-03:00",
    });
    expect(result.paymentConnection).toEqual({
      isConnected: true,
      accountId: "mp-acc-8812",
      canReceivePayments: true,
    });
    expect(result.calendarConnection).toEqual({
      status: "connected",
    });
    expect(result.activitySummary?.totalRequests).toBe(14);
    expect(result.activitySummary?.recentOperations[0].consumerName).toBe(
      "Carlos López",
    );
  });

  it("handles nullish optional fields safely", () => {
    const minimalDto = {
      ...validDto,
      profile_photo_url: null,
      identity_verification: {
        status: "pending",
        verified_at: null,
      },
      payment_connection: {
        is_connected: false,
        account_id: null,
        can_receive_payments: false,
      },
      activity_summary: null,
    };

    const result = mapProviderDiagnostic(minimalDto);
    expect(result.profilePhotoUrl).toBeUndefined();
    expect(result.identityVerification.verifiedAt).toBeUndefined();
    expect(result.paymentConnection.accountId).toBeUndefined();
    expect(result.activitySummary).toBeUndefined();
  });

  it("throws an error for invalid data", () => {
    expect(() => mapProviderDiagnostic({})).toThrow(
      "Invalid provider diagnostic data",
    );
    expect(() => mapProviderDiagnostic(null)).toThrow(
      "Invalid provider diagnostic data",
    );
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
