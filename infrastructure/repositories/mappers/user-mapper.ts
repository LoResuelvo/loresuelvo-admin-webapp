import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import type { ConsumerDetail } from "@/domain/users/consumer-history";
import {
  apiProviderDiagnosticResponseSchema,
  apiConsumerHistoryResponseSchema,
} from "@/infrastructure/api/user-types";

export function mapConsumerDetail(data: unknown): ConsumerDetail {
  const parsed = apiConsumerHistoryResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid consumer history data");
  }
  const dto = parsed.data;
  const address = dto.consumer.address;
  const addressParts = address
    ? [
        address.street,
        address.street_number,
        address.floor ? `Piso ${address.floor}` : undefined,
        address.unit ? `Depto. ${address.unit}` : undefined,
      ].filter(Boolean)
    : [];
  return {
    id: dto.consumer.id,
    name: dto.consumer.name,
    surname: dto.consumer.surname,
    email: dto.consumer.email,
    profilePhotoUrl: dto.consumer.profile_photo_url ?? undefined,
    registeredAt: dto.consumer.created_on,
    currentAddress: addressParts.join(" ") || undefined,
    coverageZone: dto.consumer.coverage_zone
      ? {
          id: dto.consumer.coverage_zone.id,
          name: dto.consumer.coverage_zone.name,
        }
      : undefined,
    history: dto.page.items.map((item) => ({
      resourceId: item.id,
      operationId: item.operation.id,
      resourceType: item.type,
      provider: {
        id: item.provider.id,
        name: `${item.provider.name} ${item.provider.surname}`.trim(),
      },
      status: item.status,
      createdAt: item.occurred_on,
    })),
    pagination: {
      limit: dto.page.limit,
      nextCursor: dto.page.next_cursor ?? undefined,
      hasMore: dto.page.next_cursor !== null,
    },
  };
}

export function mapProviderDiagnostic(data: unknown): ProviderDiagnostic {
  const parsed = apiProviderDiagnosticResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid provider diagnostic data");
  const dto = parsed.data;
  const provider = dto.provider;
  return {
    checks: dto.checks.map(check => ({
      control: check.control,
      result: check.result,
      reasonCode: check.reason_code,
      evidenceOn: check.evidence_on ?? undefined,
    })),
    id: provider.id,
    name: provider.name,
    surname: provider.surname,
    email: provider.email,
    profilePhotoUrl: provider.profile_photo_url ?? undefined,
    category: provider.category,
    coverageZones: provider.coverage_zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      isActive: zone.enabled,
    })),
    identityVerification: {
      status: provider.identity_verification_status,
      verifiedAt: provider.identity_verified_on ?? undefined,
    },
    // Connection evidence does not assert the provider's ability to receive a payment.
    paymentConnection: { isConnected: dto.payment.state === "connected", canReceivePayments: null },
    calendarConnection: { status: dto.calendar.calendar_connection_status },
    activitySummary: {
      averageRating: dto.reputation.average,
      reviewsCount: dto.reputation.count,
      recentOperations: dto.activity.map(item => ({
        id: item.id,
        resourceType: item.type,
        status: item.status,
        createdAt: item.occurred_on,
        operationsHref: `/operaciones?provider_id=${provider.id}`,
      })),
    },
  };
}
