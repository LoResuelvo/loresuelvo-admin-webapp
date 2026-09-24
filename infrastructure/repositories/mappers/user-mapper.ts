import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import type { ConsumerDetail, ConsumerHistoryItem } from "@/domain/users/consumer-history";
import {
  apiProviderDiagnosticResponseSchema,
  apiConsumerHistoryResponseSchema,
  type ApiConsumerHistoryResponse,
} from "@/infrastructure/api/user-types";

function mapConsumerHistoryItem(
  item: ApiConsumerHistoryResponse["history"][number],
): ConsumerHistoryItem {
  return {
    resourceId: item.resource_id,
    operationId: item.operation_id,
    resourceType: item.resource_type,
    categoryName: item.category_name,
    provider: {
      id: item.provider.id,
      name: item.provider.name,
      profilePhotoUrl: item.provider.profile_photo_url ?? undefined,
    },
    status: item.status,
    totalAmountCents: item.total_amount_cents,
    createdAt: item.created_at,
  };
}

export function mapConsumerDetail(data: unknown): ConsumerDetail {
  const parsed = apiConsumerHistoryResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid consumer history data");
  }
  const dto = parsed.data;
  return {
    id: dto.id,
    name: dto.name,
    surname: dto.surname,
    email: dto.email,
    phone: dto.phone,
    profilePhotoUrl: dto.profile_photo_url ?? undefined,
    registeredAt: dto.registered_at,
    currentAddress: dto.current_address,
    coverageZone: {
      id: dto.coverage_zone.id,
      name: dto.coverage_zone.name,
    },
    history: dto.history.map(mapConsumerHistoryItem),
    pagination: {
      page: dto.pagination.page,
      limit: dto.pagination.limit,
      total: dto.pagination.total,
      totalPages: dto.pagination.total_pages,
    },
  };
}

export function mapProviderDiagnostic(data: unknown): ProviderDiagnostic {
  const parsed = apiProviderDiagnosticResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid provider diagnostic data");
  }
  const dto = parsed.data;
  return {
    id: dto.id,
    name: dto.name,
    surname: dto.surname,
    email: dto.email,
    phone: dto.phone,
    profilePhotoUrl: dto.profile_photo_url ?? undefined,
    category: {
      id: dto.category.id,
      name: dto.category.name,
    },
    coverageZones: dto.coverage_zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      isActive: zone.is_active,
    })),
    identityVerification: {
      status: dto.identity_verification.status,
      verifiedAt: dto.identity_verification.verified_at ?? undefined,
    },
    paymentConnection: {
      isConnected: dto.payment_connection.is_connected,
      accountId: dto.payment_connection.account_id ?? undefined,
      canReceivePayments: dto.payment_connection.can_receive_payments,
    },
    calendarConnection: {
      status: dto.calendar_connection.status,
    },
    activitySummary: dto.activity_summary
      ? {
          totalRequests: dto.activity_summary.total_requests,
          activeOrders: dto.activity_summary.active_orders,
          completedOrders: dto.activity_summary.completed_orders,
          averageRating: dto.activity_summary.average_rating,
          reviewsCount: dto.activity_summary.reviews_count,
          recentOperations: dto.activity_summary.recent_operations.map((op) => ({
            id: op.id,
            categoryName: op.category_name,
            consumerName: op.consumer_name,
            status: op.status,
            createdAt: op.created_at,
          })),
        }
      : undefined,
  };
}
