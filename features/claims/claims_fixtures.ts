export const sampleClaimsListResponse = [
  {
    id: "clm-101",
    created_at: "2026-09-24T10:00:00Z",
    operation_id: 42,
    claimant_type: "consumer",
    claimant_name: "Ana Gómez",
    respondent_name: "Carlos López",
    category_name: "Plomería",
    status: "in_review",
    urgency: "high",
  },
  {
    id: "clm-102",
    created_at: "2026-09-22T14:30:00Z",
    operation_id: 43,
    claimant_type: "provider",
    claimant_name: "Martín Pérez",
    respondent_name: "Laura López",
    category_name: "Electricidad",
    status: "open",
    urgency: "medium",
  },
];

export const sampleFilterClaimsResponse = [
  {
    id: "clm-201",
    created_at: "2026-09-24T10:00:00Z",
    operation_id: 42,
    claimant_type: "consumer",
    claimant_name: "Carlos López",
    respondent_name: "Mariana Costa",
    category_name: "Plomería",
    status: "open",
    urgency: "high",
  },
  {
    id: "clm-202",
    created_at: "2026-09-23T11:00:00Z",
    operation_id: 43,
    claimant_type: "provider",
    claimant_name: "Laura López",
    respondent_name: "Gustavo Ruiz",
    category_name: "Gas",
    status: "resolved",
    urgency: "medium",
  },
  {
    id: "clm-203",
    created_at: "2026-09-22T09:30:00Z",
    operation_id: 44,
    claimant_type: "consumer",
    claimant_name: "Pedro Martínez",
    respondent_name: "Marcos Díaz",
    category_name: "Pintura",
    status: "open",
    urgency: "low",
  },
  {
    id: "clm-204",
    created_at: "2026-09-21T16:00:00Z",
    operation_id: 45,
    claimant_type: "provider",
    claimant_name: "Juan Silva",
    respondent_name: "María Romero",
    category_name: "Cerrajería",
    status: "dismissed",
    urgency: "low",
  },
];

export const sampleClaimDetailResponse = {
  id: "clm-101",
  created_at: "2026-09-24T10:00:00Z",
  operation_id: 42,
  claimant_type: "consumer",
  claimant_name: "Ana Gómez",
  respondent_name: "Carlos López",
  category_name: "Plomería",
  status: "in_review",
  urgency: "high",
  claim_reason: "Incumplimiento de horario y cobro indebido",
  description: "El prestador se presentó dos horas tarde y exigió un adicional no presupuestado en efectivo.",
  evidence_photo_urls: [
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80",
  ],
  resolution: null,
};

export const sampleClaimDetailOpenResponse = {
  ...sampleClaimDetailResponse,
  status: "open",
  resolution: null,
};

export const sampleClaimResolutionResponse = {
  resolution_type: "favor_consumer",
  reason: "Incumplimiento de visita pactada sin aviso previo",
  compensation_amount_cents: null,
  resolved_by: "Operador LoResuelvo",
  resolved_at: "2026-09-28T23:00:00Z",
};
