import type { OperationSummary } from "@/domain/operations/operation-summary";
import type {
  CompletionReport,
  OrderDetail,
  OperationPartyDetail,
  ProposalDetail,
  RequestDetail,
  ServiceReview,
  TimelineMilestone,
  UnifiedOperationDetail,
} from "@/domain/operations/unified-operation-detail";
import type {
  AuditedConversationResult,
  AuditedMessage,
  MessageAttachment,
} from "@/domain/operations/audited-message";
import {
  type ApiCompletionReport,
  type ApiOrderDetail,
  type ApiOperationPartyDetail,
  type ApiProposalDetail,
  type ApiRequestDetail,
  type ApiServiceReview,
  type ApiTimelineMilestone,
  apiOperationsResponseSchema,
  apiUnifiedOperationDetailResponseSchema,
} from "@/infrastructure/api/types";
import {
  type ApiAuditedMessageAttachment,
  type ApiAuditedMessageItem,
  apiAuditedConversationResponseSchema,
} from "@/infrastructure/api/audited-chat-types";

export function mapOperations(raw: unknown): OperationSummary[] {
  const parsed = apiOperationsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid operations data");
  }

  const items = Array.isArray(parsed.data)
    ? parsed.data
    : "operations" in parsed.data
      ? parsed.data.operations
      : parsed.data.items;

  return items.map((item) => ({
    id: String(item.id),
    jobRequestId: item.jobRequestId ?? item.job_request_id,
    serviceProposalId: item.serviceProposalId ?? item.service_proposal_id,
    workOrderId: item.workOrderId ?? item.work_order_id,
    consumer: {
      id: item.consumer.id,
      name: item.consumer.name,
      surname: item.consumer.surname,
      email: item.consumer.email,
    },
    provider: {
      id: item.provider.id,
      name: item.provider.name,
      surname: item.provider.surname,
      email: item.provider.email,
    },
    category: {
      id: item.category.id,
      name: item.category.name,
    },
    status: item.status,
    bottleneck: item.bottleneck,
    nextActionBy: item.nextActionBy ?? item.next_action_by ?? "none",
    createdAt: item.createdAt ?? item.created_at ?? "",
    updatedAt: item.updatedAt ?? item.updated_at ?? "",
  }));
}

function mapParty(party: ApiOperationPartyDetail): OperationPartyDetail {
  return {
    id: party.id,
    name: party.name,
    surname: party.surname,
    email: party.email,
    profilePhotoUrl: party.profilePhotoUrl ?? party.profile_photo_url ?? null,
  };
}

function mapRequest(req: ApiRequestDetail): RequestDetail {
  return {
    id: req.id,
    title: req.title,
    description: req.description,
    status: req.status,
    sourceAssessmentId: req.sourceAssessmentId ?? req.source_assessment_id ?? null,
    diagnosticSummary: req.diagnosticSummary ?? req.diagnostic_summary ?? null,
    photos: req.photos,
  };
}

function mapMilestone(m: ApiTimelineMilestone): TimelineMilestone {
  return {
    type: m.type,
    title: m.title,
    timestamp: m.timestamp,
  };
}

function mapProposal(p: ApiProposalDetail): ProposalDetail {
  return {
    id: p.id,
    amountCents: p.amountCents ?? p.amount_cents ?? 0,
    bookingDepositCents: p.bookingDepositCents ?? p.booking_deposit_cents ?? 0,
    estimatedDuration: p.estimatedDuration ?? p.estimated_duration ?? "",
    description: p.description ?? "",
    status: p.status ?? "",
    createdAt: p.createdAt ?? p.created_at ?? "",
  };
}

function mapCompletionReport(
  report: ApiCompletionReport | null | undefined,
): CompletionReport | null {
  if (!report) return null;
  return {
    completedAt: report.completedAt ?? report.completed_at ?? "",
    notes: report.notes ?? "",
    photos: report.photos ?? [],
  };
}

function mapServiceReview(
  review: ApiServiceReview | null | undefined,
): ServiceReview | null {
  if (!review) return null;
  return {
    rating: review.rating ?? 0,
    comment: review.comment ?? "",
    createdAt: review.createdAt ?? review.created_at ?? "",
  };
}

function mapOrder(order: ApiOrderDetail | null | undefined): OrderDetail | null {
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    scheduledFor: order.scheduledFor ?? order.scheduled_for ?? null,
    completionReport: mapCompletionReport(order.completionReport ?? order.completion_report),
    review: mapServiceReview(order.review),
  };
}

export function mapUnifiedOperationDetail(raw: unknown): UnifiedOperationDetail {
  const parsed = apiUnifiedOperationDetailResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid operation detail data");
  }

  const item =
    "operation" in parsed.data
      ? parsed.data.operation
      : "data" in parsed.data
        ? parsed.data.data
        : parsed.data;

  return {
    id: String(item.id),
    status: item.status,
    createdAt: item.createdAt ?? item.created_at ?? "",
    category: {
      id: item.category.id,
      name: item.category.name,
    },
    consumer: mapParty(item.consumer),
    provider: mapParty(item.provider),
    currentAddress: item.currentAddress ?? item.current_address ?? "",
    request: mapRequest(item.request),
    proposals: (item.proposals ?? []).map(mapProposal),
    order: mapOrder(item.order),
    paymentMilestones: item.paymentMilestones ?? item.payment_milestones,
    timeline: item.timeline.map(mapMilestone),
  };
}

function mapAuditedAttachment(att: ApiAuditedMessageAttachment): MessageAttachment {
  return {
    id: att.id,
    fileName: att.fileName ?? att.file_name ?? "",
    url: att.url,
  };
}

function mapAuditedMessage(item: ApiAuditedMessageItem): AuditedMessage {
  return {
    id: item.id,
    senderId: item.senderId ?? item.sender_id ?? 0,
    senderRole: (item.senderRole ?? item.sender_role ?? "consumer") as "consumer" | "provider",
    content: item.content ?? "",
    sentAt: item.sentAt ?? item.sent_at ?? "",
    attachments: (item.attachments ?? []).map(mapAuditedAttachment),
  };
}

export function mapAuditedConversation(raw: unknown): AuditedConversationResult {
  const parsed = apiAuditedConversationResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid audited conversation data");
  }

  const data = Array.isArray(parsed.data)
    ? { items: parsed.data, total: parsed.data.length }
    : "data" in parsed.data
      ? parsed.data.data
      : parsed.data;

  const items = data.items.map(mapAuditedMessage);
  const total =
    data.pagination?.total ??
    ("total" in data && typeof data.total === "number" ? data.total : items.length);

  return { items, total };
}

