import type { ApiProviderDiagnosticResponse } from "../../infrastructure/api/user-types";

export const providerDiagnosticFixture: ApiProviderDiagnosticResponse = {
  provider: {
    id: 201, name: "Juan", surname: "Gómez", email: "juan@example.com",
    profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
    category: { id: 2, name: "Plomería" },
    coverage_zones: [{ id: 6, name: "Comuna 6", enabled: true }, { id: 14, name: "Comuna 14", enabled: false }],
    identity_verification_status: "approved", identity_verified_on: "2026-09-15T12:00:00-03:00",
  },
  checks: [{ control: "payment_account_connection", result: "pass", reason_code: "payment_account_connected", evidence_on: "2026-09-15T12:00:00Z" }],
  payment: { state: "connected", token_expires_on: null },
  calendar: { calendar_connection_status: "connected", order_sync: [] },
  activity: [{ type: "work_order", id: 105, status: "scheduled", occurred_on: "2026-09-21T09:30:00-03:00" }],
  reviews: [{ work_order_id: 105, rating: 5, description: "Buen servicio" }],
  reputation: { average: 4.8, count: 9 },
  navigation: { operations_url: "/admin/operations?provider_id=201", required_permission: "read:admin_operations" },
};
