import { describe, expect, it } from "vitest";
import { mapOperations, mapUnifiedOperationDetail } from "./operation-mapper";
import { operation, party } from "./operation-fixtures";
const proposal = {
  id: 8,
  status: "accepted",
  description: "Reparación",
  amount_cents: 10000,
  currency: "ARS",
  created_on: "2026-09-20T12:00:00Z",
  scheduled_on: "2026-09-21T12:00:00Z",
  estimated_duration_minutes: 60,
  deposit_cents: 2000,
  platform_fee_total_cents: 1000,
  platform_fee_due_now_cents: 500,
  service_balance_cents: 8000,
  platform_fee_balance_cents: 500
};
const image = {
  file_id: "61f99ae1-a8b8-4591-8a9b-012393e7b54d",
  original_name: "Foto.jpg",
  mime_type: "image/jpeg",
  purpose: "job_request_image",
  created_on: "2026-09-20T12:00:00Z"
};
const detail = {
  id: "jr-1",
  started_on: "2026-09-20T12:00:00Z",
  consumer: party,
  provider: {
    ...party,
    id: 2
  },
  category: {
    id: 9,
    name: "Carpintería"
  },
  address: {
    street: "Mitre",
    street_number: "123",
    floor: null,
    unit: "A",
    source: "current_consumer_address"
  },
  job_request: {
    id: 1,
    status: "accepted",
    title: "Puerta",
    description: "No cierra",
    created_on: "2026-09-20T12:00:00Z",
    images: [image]
  },
  service_proposal: proposal,
  related_proposals: [{
      ...proposal,
      id: 9,
      operation_id: "sp-9"
    }],
  source_assessment: {
    id: 7,
    version: 1,
    outcome: "professional_required",
    category: null,
    title: "Puerta",
    description: "Marco roto",
    based_on_message_id: 1,
    created_on: "2026-09-20T12:00:00Z"
  },
  work_order: {
    id: 10,
    status: "paid",
    accepted_on: "2026-09-20T13:00:00Z",
    completion_reported_on: "2026-09-21T13:00:00Z",
    balance_paid_on: "2026-09-21T14:00:00Z",
    completion_report: {
      description: "Reparada",
      reported_on: "2026-09-21T13:00:00Z",
      images: [{
          ...image,
          purpose: "work_order_completion_image"
        }]
    },
    review: {
      rating: 5,
      description: "Buen trabajo"
    }
  },
  payment_milestones: [],
  timeline: [{
      type: "balance_paid",
      source_type: "work_order",
      source_id: "10",
      occurred_on: "2026-09-21T14:00:00Z"
    }]
};
describe("operation mapper validation", () => {
  it("rejects the obsolete flattened DTO instead of inventing missing evidence", () => {
    expect(() => mapOperations([{
        id: "op-1",
        status: "requested"
      }])).toThrow();
  });
  it("maps every actual alert without conflating it with a persisted status", () => {
    expect(mapOperations({
      operations: [{
          ...operation,
          alerts: ["booking_deadline_passed", "stalled"]
        }],
      next_cursor: null
    }).operations[0]).toMatchObject({
      status: "request_accepted",
      alerts: ["booking_deadline_passed", "stalled"]
    });
  });
  it("keeps selected proposal separate from related operations and maps persisted evidence", () => {
    const mapped = mapUnifiedOperationDetail(detail);
    expect(mapped.proposals).toEqual([{
        id: 8,
        amountCents: 10000,
        bookingDepositCents: 2000,
        estimatedDuration: "60",
        estimatedDurationMinutes: 60,
        scheduledFor: "2026-09-21T12:00:00Z",
        description: "Reparación",
        status: "accepted",
        createdAt: "2026-09-20T12:00:00Z"
      }]);
    expect(mapped).toMatchObject({
      status: "work_order_paid",
      currentAddress: "Mitre 123 A",
      request: {
        sourceAssessmentId: "7",
        diagnosticSummary: "Marco roto",
        photos: [`/api/admin/operations/jr-1/images/${image.file_id}`]
      },
      order: {
        id: 10,
        completionReport: { notes: "Reparada" },
        review: {
          rating: 5,
          comment: "Buen trabajo",
          createdAt: null
        }
      },
      timeline: [{
          type: "balance_paid",
          timestamp: "2026-09-21T14:00:00Z"
        }]
    });
  });
  it("rejects malformed persisted evidence", () => {
    expect(() => mapUnifiedOperationDetail({
      ...detail,
      job_request: {
        ...detail.job_request,
        images: [{
            ...image,
            file_id: "unsafe"
          }]
      }
    })).toThrow();
  });
});
