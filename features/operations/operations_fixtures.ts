import type { ApiOperationItem, ApiUnifiedOperationDetailItem } from "@/infrastructure/api/types";

const now = new Date().toISOString();

export const sampleOperations: ApiOperationItem[] = [
  {
    id: "jr-101", stage: "request_pending", started_on: "2026-09-18T10:00:00Z",
    job_request: { id: 101, status: "pending", created_on: "2026-09-18T10:00:00Z" },
    service_proposal: null, work_order: null,
    consumer: { id: 1, name: "Juan", surname: "Pérez" }, provider: { id: 2, name: "Carlos", surname: "López" },
    category: { id: 1, name: "Plomería" }, alerts: ["stalled", "request_pending_over_24h"],
    next_action_owner: "provider", last_business_advance_on: "2026-09-20T14:30:00Z", limitations: [],
  },
  {
    id: "jr-102", stage: "proposal_pending", started_on: now,
    job_request: { id: 102, status: "accepted", created_on: now },
    service_proposal: { id: 202, status: "pending", created_on: now, scheduled_on: now, estimated_duration_minutes: 120, booking_payment_deadline: now },
    work_order: null,
    consumer: { id: 3, name: "María", surname: "Gómez" }, provider: { id: 4, name: "Roberto", surname: "Díaz" },
    category: { id: 2, name: "Electricidad" }, alerts: ["booking_deadline_passed"],
    next_action_owner: "consumer", last_business_advance_on: now, limitations: [],
  },
  {
    id: "jr-103", stage: "request_pending", started_on: now,
    job_request: { id: 103, status: "pending", created_on: now }, service_proposal: null, work_order: null,
    consumer: { id: 5, name: "Lucía", surname: "Fernández" }, provider: { id: 6, name: "Martín", surname: "Silva" },
    category: { id: 3, name: "Gas" }, alerts: [], next_action_owner: "provider", last_business_advance_on: now, limitations: [],
  },
];

export const operationImages = [
  { file_id: "7fa39a45-2466-4c11-a640-a295dd748158", original_name: "foto-1.jpg", mime_type: "image/jpeg" as const, purpose: "job_request_image" as const, created_on: "2026-09-18T10:00:00Z" },
  { file_id: "7fa39a45-2466-4c11-a640-a295dd748159", original_name: "foto-2.jpg", mime_type: "image/jpeg" as const, purpose: "job_request_image" as const, created_on: "2026-09-18T10:00:00Z" },
];

const proposal = {
  id: 201, status: "accepted" as const, amount_cents: 4500000, deposit_cents: 900000,
  currency: "ARS" as const, estimated_duration_minutes: 180,
  description: "Desmonte de bacha, recambio de cañería averiada y sellado siliconado.",
  created_on: "2026-09-19T11:30:00Z", scheduled_on: "2026-09-25T09:00:00Z",
  platform_fee_total_cents: 450000, platform_fee_due_now_cents: 450000,
  service_balance_cents: 3600000, platform_fee_balance_cents: 0,
};

const order = {
  id: 301, status: "scheduled" as const, accepted_on: "2026-09-20T14:00:00Z",
  completion_reported_on: null, balance_paid_on: null, completion_report: null, review: null,
};

export const sampleOperationDetail: ApiUnifiedOperationDetailItem = {
  id: "jr-101", started_on: "2026-09-18T10:00:00Z", category: { id: 1, name: "Plomería" },
  consumer: { id: 10, name: "Ana", surname: "Martínez" }, provider: { id: 20, name: "Carlos", surname: "López" },
  address: { street: "Av. Corrientes", street_number: "1234", floor: null, unit: null, source: "current_consumer_address" },
  job_request: { id: 101, title: "Reparación de cañería en cocina", description: "Pérdida continua de agua bajo la bacha de la cocina.", status: "accepted", created_on: "2026-09-18T10:00:00Z", images: operationImages },
  source_assessment: { id: 77, version: 1, outcome: "matched", category: { id: 1, name: "Plomería" }, title: "Diagnóstico de cocina", description: "Posible fisura en sifón de desagüe con goteo constante.", based_on_message_id: 1, created_on: "2026-09-18T09:00:00Z" },
  service_proposal: proposal, related_proposals: [], work_order: order, payment_milestones: [],
  timeline: [
    { type: "job_request_created", source_type: "job_request", source_id: "101", occurred_on: "2026-09-18T10:00:00Z" },
    { type: "service_proposal_created", source_type: "service_proposal", source_id: "201", occurred_on: "2026-09-19T11:30:00Z" },
    { type: "work_order_accepted", source_type: "work_order", source_id: "301", occurred_on: "2026-09-20T14:00:00Z" },
  ],
};

export const sampleOperationWithProposalAndOrder = sampleOperationDetail;

export const sampleOperationWithCompletionAndReview: ApiUnifiedOperationDetailItem = {
  ...sampleOperationDetail,
  work_order: {
    ...order, status: "paid", completion_reported_on: "2026-09-25T15:30:00Z", balance_paid_on: "2026-09-25T16:00:00Z",
    completion_report: {
      reported_on: "2026-09-25T15:30:00Z", description: "Se reparó con éxito la pérdida del sifón y se colocó caño corrugado nuevo con junta de estanqueidad.",
      images: operationImages.map((image) => ({ ...image, purpose: "work_order_completion_image" })),
    },
    review: { rating: 5, description: "Excelente trabajo de Carlos, muy prolijo y puntual. Resolvió todo en el tiempo pactado." },
  },
};

export function operationPage(operations: ApiOperationItem[]) {
  return { operations, next_cursor: null };
}
