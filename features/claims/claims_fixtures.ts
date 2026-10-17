import type { ApiClaimListItem } from "../../infrastructure/api/claims-types";

function summary(id: number, email: string, category: string, status: ApiClaimListItem["status"], party: ApiClaimListItem["claimant_party"] = "consumer"): ApiClaimListItem {
  return { id, created_on: "2026-09-24T10:00:00Z", operation_id: `sp-${id === 101 ? 42 : 43}`,
    claimant_id: id + 1000, claimant_party: party, claimant_email: email,
    category_id: 2, category_name: category, status, reason: "non_compliance", age_seconds: 3600 };
}

export const sampleClaimsListResponse = {
  items: [summary(101, "ana@example.com", "Plomería", "in_review"), summary(102, "martin@example.com", "Electricidad", "open", "provider")],
  page: 1, limit: 20, total: 2,
};
export const sampleFilterClaimsResponse = {
  items: [summary(201, "carlos.lopez@example.com", "Plomería", "open"), summary(202, "laura.lopez@example.com", "Gas", "resolved", "provider"), summary(203, "pedro@example.com", "Pintura", "open"), summary(204, "juan@example.com", "Cerrajería", "dismissed", "provider")],
  page: 1, limit: 20, total: 4,
};
export const sampleClaimDetailResponse = {
  id: 101, created_on: "2026-09-24T10:00:00Z", operation_id: "sp-42", status: "in_review",
  reference: { work_order_id: 42 }, reason: "non_compliance", review_started_on: "2026-09-24T11:00:00Z", closed_on: null,
  claimant: { id: 1101, party: "consumer", email: "ana@example.com" }, category_id: 2, category_name: "Plomería",
  description: "El prestador se presentó dos horas tarde y exigió un adicional no presupuestado en efectivo.",
  images: [
    { file_id: "61f99ae1-a8b8-4591-8a9b-012393e7b54d", url: "https://example.com/evidence-1.jpg" },
    { file_id: "61f99ae1-a8b8-4591-8a9b-012393e7b54e", url: "https://example.com/evidence-2.jpg" },
  ], resolution: null,
};
export const sampleClaimDetailOpenResponse = { ...sampleClaimDetailResponse, status: "open", review_started_on: null };
export const sampleClaimResolutionResponse = {
  id: 101, status: "resolved", action: { id: 1, type: "resolved", actor_id: 1, actor_party: "operator", created_on: "2026-09-28T23:00:00Z" },
  resolution: { type: "consumer_favor", reasoning: "Incumplimiento de visita pactada sin aviso previo", suggested_compensation: null, resolved_on: "2026-09-28T23:00:00Z" },
};
