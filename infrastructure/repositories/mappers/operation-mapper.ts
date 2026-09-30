import type { OperationPage, OperationSummary } from "@/domain/operations/operation-summary";
import type { UnifiedOperationDetail, ProposalDetail, RequestDetail, OrderDetail } from "@/domain/operations/unified-operation-detail";
import {
  apiOperationsResponseSchema,
  apiUnifiedOperationDetailResponseSchema,
  type ApiOperationItem,
  type ApiProposalDetail,
  type ApiUnifiedOperationDetailItem,
} from "@/infrastructure/api/operations-types";
export { mapAuditedConversation } from "./audited-conversation-mapper";

function mapSummary(item: ApiOperationItem): OperationSummary {
  return {
    id: item.id,
    jobRequestId: item.job_request?.id,
    serviceProposalId: item.service_proposal?.id,
    workOrderId: item.work_order?.id,
    consumer: item.consumer,
    provider: item.provider,
    category: item.category,
    status: item.stage,
    alerts: item.alerts,
    nextActionBy: item.next_action_owner,
    createdAt: item.started_on,
    updatedAt: item.last_business_advance_on,
  };
}

export function mapOperations(raw: unknown): OperationPage {
  const data = apiOperationsResponseSchema.parse(raw);
  return {
    nextCursor: data.next_cursor,
    operations: data.operations.map(mapSummary),
  };
}

function mapProposal(proposal: ApiProposalDetail): ProposalDetail {
  return {
    id: proposal.id,
    amountCents: proposal.amount_cents,
    bookingDepositCents: proposal.deposit_cents,
    estimatedDuration: String(proposal.estimated_duration_minutes),
    estimatedDurationMinutes: proposal.estimated_duration_minutes,
    scheduledFor: proposal.scheduled_on,
    description: proposal.description,
    status: proposal.status,
    createdAt: proposal.created_on,
  };
}

function imageUrl(operationId: string, fileId: string): string {
  // This same-origin route requires the session and delegates object access
  // authorization to the protected API endpoint. No storage URL is exposed.
  return `/api/admin/operations/${operationId}/images/${fileId}`;
}

function mapRequest(item: ApiUnifiedOperationDetailItem): RequestDetail | null {
  const request = item.job_request;
  if (!request) return null;
  return {
    id: request.id,
    title: request.title,
    description: request.description,
    status: request.status,
    photos: request.images.map(image => imageUrl(item.id, image.file_id)),
    sourceAssessmentId: item.source_assessment ? String(item.source_assessment.id) : null,
    diagnosticSummary: item.source_assessment?.description ?? null,
  };
}

function mapOrder(item: ApiUnifiedOperationDetailItem): OrderDetail | null {
  const order = item.work_order;
  if (!order) return null;
  const report = order.completion_report;
  const review = order.review;
  return {
    id: order.id,
    status: order.status,
    scheduledFor: item.service_proposal?.scheduled_on ?? null,
    completionReport: report ? {
      completedAt: report.reported_on,
      notes: report.description,
      photos: report.images.map(image => imageUrl(item.id, image.file_id)),
    } : null,
    review: review ? {
      rating: review.rating,
      comment: review.description,
      // The resource does not record a review timestamp.
      createdAt: null,
    } : null,
  };
}

function detailStage(item: ApiUnifiedOperationDetailItem): UnifiedOperationDetail["status"] {
  if (item.work_order) return `work_order_${item.work_order.status}`;
  if (item.service_proposal) return `proposal_${item.service_proposal.status}`;
  if (item.job_request) return `request_${item.job_request.status}`;
  return null;
}

export function mapUnifiedOperationDetail(raw: unknown): UnifiedOperationDetail {
  const item = apiUnifiedOperationDetailResponseSchema.parse(raw);
  const address = item.address;
  return {
    id: item.id,
    status: detailStage(item),
    createdAt: item.started_on,
    category: item.category,
    consumer: item.consumer,
    provider: item.provider,
    currentAddress: address ? [address.street, address.street_number, address.floor, address.unit].filter(Boolean).join(" ") : null,
    request: mapRequest(item),
    proposals: item.service_proposal ? [mapProposal(item.service_proposal)] : [],
    relatedProposals: item.related_proposals.map(proposal => ({
      ...mapProposal(proposal),
      operationId: proposal.operation_id,
    })),
    order: mapOrder(item),
    paymentMilestones: item.payment_milestones.map(payment => ({
      id: payment.id,
      purpose: payment.purpose,
      status: payment.status,
      createdOn: payment.created_on,
    })),
    timeline: item.timeline.map(event => ({
      type: event.type,
      title: event.type,
      timestamp: event.occurred_on,
    })),
  };
}
