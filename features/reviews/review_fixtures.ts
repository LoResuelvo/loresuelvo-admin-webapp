const reportedReview = {
  work_order_id: 101,
  consumer_id: 10,
  provider_id: 20,
  operation_id: "work_order-101",
  rating: 1,
  visibility: "visible",
  version: 3,
  pending_report_count: 1,
  reported_on: "2026-09-25T14:00:00Z",
};

const secondReportedReview = {
  work_order_id: 102,
  consumer_id: 11,
  provider_id: 21,
  operation_id: "work_order-102",
  rating: 2,
  visibility: "visible",
  version: 1,
  pending_report_count: 1,
  reported_on: "2026-09-24T18:30:00Z",
};

const hiddenReview = {
  work_order_id: 203,
  consumer_id: 13,
  provider_id: 23,
  operation_id: "work_order-203",
  rating: 1,
  visibility: "hidden",
  version: 4,
  pending_report_count: 0,
  reported_on: "2026-09-23T15:00:00Z",
};

export const sampleReportedReviewsListResponse = {
  items: [reportedReview, secondReportedReview],
  page: 1,
  limit: 100,
  total: 2,
};

export const sampleMixedReviewsListResponse = {
  items: [
    {
      work_order_id: 201,
      consumer_id: 12,
      provider_id: 22,
      operation_id: "work_order-201",
      rating: 5,
      visibility: "visible",
      version: 2,
      pending_report_count: 0,
      reported_on: null,
    },
    {
      work_order_id: 202,
      consumer_id: 12,
      provider_id: 22,
      operation_id: "work_order-202",
      rating: 1,
      visibility: "visible",
      version: 1,
      pending_report_count: 1,
      reported_on: "2026-09-24T11:00:00Z",
    },
    hiddenReview,
  ],
  page: 1,
  limit: 100,
  total: 3,
};

export const sampleReportedReviewDetail = {
  review: reportedReview,
  description: "El trabajo fue pésimo y además me insultó al retirarse.",
  report: {
    id: 501,
    category: "abusive_language",
    explanation: "Lenguaje agraviante y trato ofensivo",
    status: "pending",
    created_on: "2026-09-25T14:00:00Z",
  },
  decisions: { items: [], page: 1, limit: 20, total: 0, has_more: false },
};

export const sampleHiddenReviewDetail = {
  review: hiddenReview,
  description: "Contenido difamatorio y ofensivo.",
  report: {
    id: 503,
    category: "abusive_language",
    explanation: "Lenguaje ofensivo hacia el prestador",
    status: "upheld",
    created_on: "2026-09-23T15:00:00Z",
  },
  decisions: {
    items: [{
      id: 88,
      work_order_id: 203,
      operator_id: 4,
      action: "hide",
      category: "abusive_language",
      reason: "Uso explícito de agravios e insultos",
      report_id: 503,
      previous_hide_id: null,
      created_on: "2026-09-23T16:00:00Z",
    }],
    page: 1,
    limit: 20,
    total: 1,
    has_more: false,
  },
};

export const sampleModeratedOffensiveReviewResponse = {
  work_order_id: 101,
  visibility: "hidden",
  version: 4,
  decision_id: 89,
};

export const sampleHiddenReviewListResponse = {
  items: [hiddenReview],
  page: 1,
  limit: 100,
  total: 1,
};

export const sampleRestoredReviewResponse = {
  work_order_id: 203,
  visibility: "visible",
  version: 5,
  decision_id: 90,
};
