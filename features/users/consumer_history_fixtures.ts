import type { ApiConsumerHistoryResponse } from "@/infrastructure/api/user-types";

function operationReference(id: string) {
  return {
    id,
    url: `/admin/operations/${id}`,
    required_permission: "read:admin_operations" as const,
    chat_required_permission: "read:admin_chat_audit" as const,
  };
}

export const defaultConsumerHistory: ApiConsumerHistoryResponse = {
  consumer: {
    id: 301, role: "consumer", name: "Carlos", surname: "López",
    email: "carlos@example.com", profile_photo_url: null,
    created_on: "2026-09-01T10:00:00-03:00",
    address: {
      street: "Av. Rivadavia", street_number: "4500", floor: null, unit: null,
      source: "current_consumer_profile",
    },
    coverage_zone: {
      id: 6, name: "Comuna 6", enabled: true, source: "current_consumer_profile",
    },
  },
  summary: { job_requests: 0, service_proposals: 0, work_orders: 1 },
  page: {
    limit: 20, next_cursor: null,
    items: [{
      type: "work_order", id: 105, status: "paid",
      provider: { id: 201, name: "Juan", surname: "Gómez" },
      operation: operationReference("jr-105"),
      occurred_on: "2026-09-20T10:00:00-03:00",
      job_request_id: 105, service_proposal_id: 205,
      accepted_on: "2026-09-20T10:00:00-03:00",
      completion_reported_on: "2026-09-21T10:00:00-03:00",
      balance_paid_on: "2026-09-22T10:00:00-03:00",
    }],
  },
};

export const multipleInteractionsConsumer: ApiConsumerHistoryResponse = {
  ...defaultConsumerHistory,
  summary: { job_requests: 1, service_proposals: 1, work_orders: 1 },
  page: {
    limit: 20, next_cursor: null,
    items: [
      {
        type: "service_proposal", id: 107, status: "pending",
        provider: { id: 203, name: "Ana", surname: "Electricista" },
        operation: operationReference("sp-107"), job_request_id: null,
        occurred_on: "2026-09-22T10:00:00-03:00",
        created_on: "2026-09-22T10:00:00-03:00",
        scheduled_on: "2026-09-25T10:00:00-03:00",
        estimated_duration_minutes: 60,
        booking_payment_deadline: "2026-09-24T10:00:00-03:00",
      },
      {
        type: "job_request", id: 106, status: "pending",
        provider: { id: 202, name: "Pedro", surname: "Gasista" },
        operation: operationReference("jr-106"),
        occurred_on: "2026-09-21T10:00:00-03:00",
        created_on: "2026-09-21T10:00:00-03:00",
      },
      ...defaultConsumerHistory.page.items,
    ],
  },
};

export const emptyConsumer: ApiConsumerHistoryResponse = {
  ...defaultConsumerHistory,
  summary: { job_requests: 0, service_proposals: 0, work_orders: 0 },
  page: { items: [], limit: 20, next_cursor: null },
};
