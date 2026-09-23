import type { OperationSummary } from "@/domain/operations/operation-summary";
import type {
  OperationPartyDetail,
  RequestDetail,
  TimelineMilestone,
  UnifiedOperationDetail,
} from "@/domain/operations/unified-operation-detail";
import {
  type ApiOperationPartyDetail,
  type ApiRequestDetail,
  type ApiTimelineMilestone,
  apiOperationsResponseSchema,
  apiUnifiedOperationDetailResponseSchema,
} from "@/infrastructure/api/types";

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
    proposals: item.proposals,
    order: item.order,
    paymentMilestones: item.paymentMilestones ?? item.payment_milestones,
    timeline: item.timeline.map(mapMilestone),
  };
}
