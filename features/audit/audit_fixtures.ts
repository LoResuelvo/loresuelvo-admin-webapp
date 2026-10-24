const firstAuditEvent = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  occurred_on: "2026-09-28T14:30:00Z",
  operator_id: 101,
  operator_name: "Sofía López",
  action: "access",
  resource_type: "operation",
  resource_id: "105",
  reason: "Investigación de reporte por posible fraude en la conversación",
  correlation_id: "trace-001",
  result: "succeeded",
};

const secondAuditEvent = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  occurred_on: "2026-09-27T10:15:00Z",
  operator_id: 102,
  action: "execute",
  resource_type: "claim",
  resource_id: "clm-204",
  reason: "Resolución de disputa económica a favor del consumidor",
  correlation_id: "trace-002",
  result: "prepared",
};

export const sampleAuditLogsResponse = {
  events: [firstAuditEvent, secondAuditEvent],
  next_cursor: null,
};

export const multiMonthAuditLogsResponse = {
  events: [
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      occurred_on: "2026-08-15T09:00:00Z",
      operator_id: 103,
      action: "create",
      resource_type: "category",
      resource_id: "cat-1",
      reason: "Creación de nueva categoría de servicios del hogar",
      correlation_id: "trace-003",
      result: "succeeded",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      occurred_on: "2026-09-10T11:00:00Z",
      operator_id: 101,
      action: "access",
      resource_type: "provider",
      resource_id: "prov-301",
      reason: "Consulta de información durante validación de matrícula",
      correlation_id: "trace-004",
      result: "succeeded",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      occurred_on: "2026-09-18T16:20:00Z",
      operator_id: 102,
      action: "execute",
      resource_type: "review",
      resource_id: "rev-88",
      reason: "Ocultamiento de reseña ofensiva reportada",
      correlation_id: "trace-005",
      result: "failed",
    },
    firstAuditEvent,
  ],
  next_cursor: null,
};

export const firstAuditPage = {
  events: [firstAuditEvent],
  next_cursor: "opaque-audit-cursor",
};

export const secondAuditPage = {
  events: [secondAuditEvent],
  next_cursor: null,
};
