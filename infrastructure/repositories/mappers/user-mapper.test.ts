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
    id: 301,
    name: "Carlos",
    surname: "López",
    email: "carlos@example.com",
    phone: "+54 11 4444-2222",
    profile_photo_url: "https://storage.loresuelvo.internal/profiles/301.jpg",
    registered_at: "2026-09-01T10:00:00-03:00",
    current_address: "Av. Rivadavia 4500",
    coverage_zone: {
      id: 6,
      name: "Comuna 6",
    },
    history: [
      {
        resource_id: 105,
        operation_id: 105,
        resource_type: "work_order",
        category_name: "Plomería",
        provider: {
          id: 201,
          name: "Juan Gómez",
          profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
        },
        status: "completed",
        total_amount_cents: 2000000,
        created_at: "2026-09-20T10:00:00-03:00",
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      total_pages: 1,
    },
  };

  it("maps valid DTO to domain ConsumerDetail entity", () => {
    const result = mapConsumerDetail(validConsumerDto);

    expect(result.id).toBe(301);
    expect(result.name).toBe("Carlos");
    expect(result.surname).toBe("López");
    expect(result.email).toBe("carlos@example.com");
    expect(result.phone).toBe("+54 11 4444-2222");
    expect(result.profilePhotoUrl).toBe(
      "https://storage.loresuelvo.internal/profiles/301.jpg",
    );
    expect(result.registeredAt).toBe("2026-09-01T10:00:00-03:00");
    expect(result.currentAddress).toBe("Av. Rivadavia 4500");
    expect(result.coverageZone).toEqual({ id: 6, name: "Comuna 6" });
    expect(result.history).toHaveLength(1);
    expect(result.history[0]).toEqual({
      resourceId: 105,
      operationId: 105,
      resourceType: "work_order",
      categoryName: "Plomería",
      provider: {
        id: 201,
        name: "Juan Gómez",
        profilePhotoUrl: "https://storage.loresuelvo.internal/profiles/201.jpg",
      },
      status: "completed",
      totalAmountCents: 2000000,
      createdAt: "2026-09-20T10:00:00-03:00",
    });
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("handles nullish profilePhotoUrl safely", () => {
    const dtoWithoutPhoto = {
      ...validConsumerDto,
      profile_photo_url: null,
      history: [
        {
          ...validConsumerDto.history[0],
          provider: {
            id: 201,
            name: "Juan Gómez",
            profile_photo_url: null,
          },
        },
      ],
    };

    const result = mapConsumerDetail(dtoWithoutPhoto);
    expect(result.profilePhotoUrl).toBeUndefined();
    expect(result.history[0].provider.profilePhotoUrl).toBeUndefined();
  });

  it("throws an error for invalid data", () => {
    expect(() => mapConsumerDetail({})).toThrow("Invalid consumer history data");
    expect(() => mapConsumerDetail(null)).toThrow("Invalid consumer history data");
  });
});

