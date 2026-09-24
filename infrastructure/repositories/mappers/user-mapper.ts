import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import { apiProviderDiagnosticResponseSchema } from "@/infrastructure/api/user-types";

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
