import { z } from "zod";
const id = z.number().int().positive();
const timestamp = z.string().datetime({ offset: true });
export const apiOperationPartySchema = z.object({
  id,
  name: z.string(),
  surname: z.string()
});
export const apiOperationCategorySchema = z.object({
  id,
  name: z.string()
});
export const apiOperationStatusSchema = z.enum([
  "request_pending",
  "request_accepted",
  "proposal_pending",
  "proposal_rejected",
  "work_order_scheduled",
  "work_order_awaiting_payment",
  "work_order_paid"
]);
export const apiOperationBottleneckSchema = z.enum([
  "request_pending_over_24h",
  "booking_deadline_passed",
  "delayed",
  "stalled"
]);
export const apiOperationResponsibleSchema = z.enum(["consumer", "provider", "none"]);
const requestSummary = z.object({
  id,
  status: z.enum(["pending", "accepted"]),
  created_on: timestamp
});
const proposalSummary = z.object({
  id,
  status: z.enum(["pending", "accepted", "rejected"]),
  created_on: timestamp,
  scheduled_on: timestamp,
  estimated_duration_minutes: z.number(),
  booking_payment_deadline: timestamp
});
const orderSummary = z.object({
  id,
  status: z.enum(["scheduled", "awaiting_payment", "paid"]),
  accepted_on: timestamp,
  completion_reported_on: timestamp.nullable(),
  balance_paid_on: timestamp.nullable()
});
export const apiOperationItemSchema = z.object({
  id: z.string().regex(/^(jr|sp)-[1-9][0-9]*$/),
  stage: apiOperationStatusSchema,
  started_on: timestamp,
  job_request: requestSummary.nullable(),
  service_proposal: proposalSummary.nullable(),
  work_order: orderSummary.nullable(),
  consumer: apiOperationPartySchema,
  provider: apiOperationPartySchema,
  category: apiOperationCategorySchema.nullable(),
  alerts: z.array(apiOperationBottleneckSchema),
  next_action_owner: apiOperationResponsibleSchema.nullable(),
  last_business_advance_on: timestamp.nullable(),
  limitations: z.array(z.enum(["request_acceptance_time_unavailable"]))
});
export const apiOperationsResponseSchema = z.object({
  operations: z.array(apiOperationItemSchema),
  next_cursor: z.string().nullable()
});
const image = z.object({
  file_id: z.string().uuid(),
  original_name: z.string(),
  mime_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  purpose: z.enum(["job_request_image", "work_order_completion_image"]),
  created_on: timestamp
});
export const apiOperationPartyDetailSchema = apiOperationPartySchema;
export const apiRequestDetailSchema = requestSummary.extend({
  title: z.string(),
  description: z.string(),
  images: z.array(image)
});
export const apiProposalDetailSchema = z.object({
  id,
  status: z.enum(["pending", "accepted", "rejected"]),
  description: z.string(),
  amount_cents: z.number().int(),
  currency: z.literal("ARS"),
  created_on: timestamp,
  scheduled_on: timestamp,
  estimated_duration_minutes: z.number().int(),
  deposit_cents: z.number().int(),
  platform_fee_total_cents: z.number().int(),
  platform_fee_due_now_cents: z.number().int(),
  service_balance_cents: z.number().int(),
  platform_fee_balance_cents: z.number().int()
});
export const apiCompletionReportSchema = z.object({
  description: z.string(),
  reported_on: timestamp,
  images: z.array(image)
});
export const apiServiceReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  description: z.string()
});
export const apiOrderDetailSchema = orderSummary.extend({
  completion_report: apiCompletionReportSchema.nullable(),
  review: apiServiceReviewSchema.nullable()
});
export const apiTimelineMilestoneSchema = z.object({
  type: z.enum([
    "job_request_created",
    "service_proposal_created",
    "work_order_accepted",
    "completion_reported",
    "balance_paid",
    "payment_intent_created"
  ]),
  source_type: z.enum([
    "job_request",
    "service_proposal",
    "work_order",
    "payment_intent"
  ]),
  source_id: z.string(),
  occurred_on: timestamp
});
export const apiUnifiedOperationDetailItemSchema = z.object({
  id: z.string().regex(/^(jr|sp)-[1-9][0-9]*$/),
  started_on: timestamp,
  job_request: apiRequestDetailSchema.nullable(),
  service_proposal: apiProposalDetailSchema.nullable(),
  related_proposals: z.array(apiProposalDetailSchema.extend({ operation_id: z.string() })),
  work_order: apiOrderDetailSchema.nullable(),
  payment_milestones: z.array(z.object({
    id: z.string().uuid(),
    purpose: z.enum(["booking_deposit", "service_balance"]),
    status: z.string(),
    created_on: timestamp
  })),
  timeline: z.array(apiTimelineMilestoneSchema),
  consumer: apiOperationPartySchema,
  provider: apiOperationPartySchema,
  category: apiOperationCategorySchema.nullable(),
  address: z.object({
    street: z.string(),
    street_number: z.string(),
    floor: z.string().nullable(),
    unit: z.string().nullable(),
    source: z.literal("current_consumer_address")
  }).nullable(),
  source_assessment: z.object({
    id,
    version: z.number(),
    outcome: z.string(),
    category: apiOperationCategorySchema.nullable(),
    title: z.string(),
    description: z.string(),
    based_on_message_id: id,
    created_on: timestamp
  }).nullable()
});
export const apiUnifiedOperationDetailResponseSchema = apiUnifiedOperationDetailItemSchema;
export type ApiOperationParty = z.infer<typeof apiOperationPartySchema>;
export type ApiOperationCategory = z.infer<typeof apiOperationCategorySchema>;
export type ApiOperationItem = z.infer<typeof apiOperationItemSchema>;
export type ApiOperationsResponse = z.infer<typeof apiOperationsResponseSchema>;
export type ApiTimelineMilestone = z.infer<typeof apiTimelineMilestoneSchema>;
export type ApiOperationPartyDetail = z.infer<typeof apiOperationPartyDetailSchema>;
export type ApiRequestDetail = z.infer<typeof apiRequestDetailSchema>;
export type ApiProposalDetail = z.infer<typeof apiProposalDetailSchema>;
export type ApiCompletionReport = z.infer<typeof apiCompletionReportSchema>;
export type ApiServiceReview = z.infer<typeof apiServiceReviewSchema>;
export type ApiOrderDetail = z.infer<typeof apiOrderDetailSchema>;
export type ApiUnifiedOperationDetailItem = z.infer<typeof apiUnifiedOperationDetailItemSchema>;
export type ApiUnifiedOperationDetailResponse = z.infer<typeof apiUnifiedOperationDetailResponseSchema>;
