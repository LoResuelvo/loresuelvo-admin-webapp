import { z } from "zod";

export const apiOperationPartySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.string().email(),
});

export type ApiOperationParty = z.infer<typeof apiOperationPartySchema>;

export const apiOperationCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
});

export const apiOperationBottleneckSchema = z.enum([
  "pending_proposal_24h",
  "pending_booking_deposit",
  "scheduled_today",
  "delayed_service",
  "pending_final_payment",
  "stalled",
  "none",
]);

export const apiOperationStatusSchema = z.enum([
  "requested",
  "quoted",
  "in_progress",
  "completed",
  "cancelled",
]);

export const apiOperationResponsibleSchema = z.enum([
  "consumer",
  "provider",
  "platform",
  "none",
]);

export const apiOperationItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  job_request_id: z.number().int().positive().optional(),
  jobRequestId: z.number().int().positive().optional(),
  service_proposal_id: z.number().int().positive().optional(),
  serviceProposalId: z.number().int().positive().optional(),
  work_order_id: z.number().int().positive().optional(),
  workOrderId: z.number().int().positive().optional(),
  consumer: apiOperationPartySchema,
  provider: apiOperationPartySchema,
  category: apiOperationCategorySchema,
  status: apiOperationStatusSchema,
  bottleneck: apiOperationBottleneckSchema,
  next_action_by: apiOperationResponsibleSchema.optional(),
  nextActionBy: apiOperationResponsibleSchema.optional(),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  updated_at: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ApiOperationItem = z.infer<typeof apiOperationItemSchema>;

export const apiOperationsResponseSchema = z.union([
  z.array(apiOperationItemSchema),
  z.object({ operations: z.array(apiOperationItemSchema) }),
  z.object({ items: z.array(apiOperationItemSchema) }),
]);

export type ApiOperationsResponse = z.infer<typeof apiOperationsResponseSchema>;

export const apiTimelineMilestoneSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  timestamp: z.string().min(1),
});

export type ApiTimelineMilestone = z.infer<typeof apiTimelineMilestoneSchema>;

export const apiOperationPartyDetailSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.string().email(),
  profile_photo_url: z.string().nullish(),
  profilePhotoUrl: z.string().nullish(),
});

export type ApiOperationPartyDetail = z.infer<typeof apiOperationPartyDetailSchema>;

export const apiRequestDetailSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.string().min(1),
  source_assessment_id: z.string().nullish(),
  sourceAssessmentId: z.string().nullish(),
  diagnostic_summary: z.string().nullish(),
  diagnosticSummary: z.string().nullish(),
  photos: z.array(z.string()).default([]),
});

export type ApiRequestDetail = z.infer<typeof apiRequestDetailSchema>;

export const apiProposalDetailSchema = z.object({
  id: z.number().int().positive(),
  amount_cents: z.number().int().nonnegative().optional(),
  amountCents: z.number().int().nonnegative().optional(),
  booking_deposit_cents: z.number().int().nonnegative().optional(),
  bookingDepositCents: z.number().int().nonnegative().optional(),
  estimated_duration: z.string().optional().default(""),
  estimatedDuration: z.string().optional(),
  description: z.string().optional().default(""),
  status: z.string().optional().default("sent"),
  created_at: z.string().optional().default(""),
  createdAt: z.string().optional(),
});

export type ApiProposalDetail = z.infer<typeof apiProposalDetailSchema>;

export const apiCompletionReportSchema = z.object({
  completed_at: z.string().optional().default(""),
  completedAt: z.string().optional(),
  notes: z.string().optional().default(""),
  photos: z.array(z.string()).default([]),
});

export type ApiCompletionReport = z.infer<typeof apiCompletionReportSchema>;

export const apiServiceReviewSchema = z.object({
  rating: z.number().min(0).max(5).default(0),
  comment: z.string().optional().default(""),
  created_at: z.string().optional().default(""),
  createdAt: z.string().optional(),
});

export type ApiServiceReview = z.infer<typeof apiServiceReviewSchema>;

export const apiOrderDetailSchema = z.object({
  id: z.number().int().positive(),
  status: z.string().min(1),
  scheduled_for: z.string().nullish(),
  scheduledFor: z.string().nullish(),
  completion_report: apiCompletionReportSchema.nullish(),
  completionReport: apiCompletionReportSchema.nullish(),
  review: apiServiceReviewSchema.nullish(),
});

export type ApiOrderDetail = z.infer<typeof apiOrderDetailSchema>;

export const apiUnifiedOperationDetailItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  status: apiOperationStatusSchema,
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  category: apiOperationCategorySchema,
  consumer: apiOperationPartyDetailSchema,
  provider: apiOperationPartyDetailSchema,
  current_address: z.string().optional(),
  currentAddress: z.string().optional(),
  request: apiRequestDetailSchema,
  proposals: z.array(apiProposalDetailSchema).default([]),
  order: apiOrderDetailSchema.nullish(),
  payment_milestones: z.unknown().optional(),
  paymentMilestones: z.unknown().optional(),
  timeline: z.array(apiTimelineMilestoneSchema).default([]),
});

export type ApiUnifiedOperationDetailItem = z.infer<typeof apiUnifiedOperationDetailItemSchema>;

export const apiUnifiedOperationDetailResponseSchema = z.union([
  apiUnifiedOperationDetailItemSchema,
  z.object({ operation: apiUnifiedOperationDetailItemSchema }),
  z.object({ data: apiUnifiedOperationDetailItemSchema }),
]);

export type ApiUnifiedOperationDetailResponse = z.infer<
  typeof apiUnifiedOperationDetailResponseSchema
>;
