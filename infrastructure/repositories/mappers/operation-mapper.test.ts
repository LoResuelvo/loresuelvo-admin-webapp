import { describe, expect, it } from "vitest";
import { mapOperations } from "./operation-mapper";

describe("operation-mapper", () => {
  const sampleSnakeCaseItem = {
    id: "op-1",
    job_request_id: 101,
    service_proposal_id: 201,
    work_order_id: 301,
    consumer: {
      id: 1,
      name: "Juan",
      surname: "Pérez",
      email: "juan.perez@example.com",
    },
    provider: {
      id: 2,
      name: "Carlos",
      surname: "López",
      email: "carlos.lopez@example.com",
    },
    category: {
      id: 1,
      name: "Plomería",
    },
    status: "in_progress" as const,
    bottleneck: "stalled" as const,
    next_action_by: "provider" as const,
    created_at: "2026-09-18T10:00:00Z",
    updated_at: "2026-09-20T14:30:00Z",
  };

  const sampleCamelCaseItem = {
    id: "op-2",
    jobRequestId: 102,
    serviceProposalId: 202,
    workOrderId: 302,
    consumer: {
      id: 3,
      name: "María",
      surname: "Gómez",
      email: "maria.gomez@example.com",
    },
    provider: {
      id: 4,
      name: "Roberto",
      surname: "Díaz",
      email: "roberto.diaz@example.com",
    },
    category: {
      id: 2,
      name: "Electricidad",
    },
    status: "quoted" as const,
    bottleneck: "pending_proposal_24h" as const,
    nextActionBy: "consumer" as const,
    createdAt: "2026-09-21T09:00:00Z",
    updatedAt: "2026-09-22T11:00:00Z",
  };

  it("maps array of snake_case items correctly", () => {
    const result = mapOperations([sampleSnakeCaseItem]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "op-1",
      jobRequestId: 101,
      serviceProposalId: 201,
      workOrderId: 301,
      consumer: {
        id: 1,
        name: "Juan",
        surname: "Pérez",
        email: "juan.perez@example.com",
      },
      provider: {
        id: 2,
        name: "Carlos",
        surname: "López",
        email: "carlos.lopez@example.com",
      },
      category: {
        id: 1,
        name: "Plomería",
      },
      status: "in_progress",
      bottleneck: "stalled",
      nextActionBy: "provider",
      createdAt: "2026-09-18T10:00:00Z",
      updatedAt: "2026-09-20T14:30:00Z",
    });
  });

  it("maps array of camelCase items correctly", () => {
    const result = mapOperations([sampleCamelCaseItem]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "op-2",
      jobRequestId: 102,
      serviceProposalId: 202,
      workOrderId: 302,
      consumer: {
        id: 3,
        name: "María",
        surname: "Gómez",
        email: "maria.gomez@example.com",
      },
      provider: {
        id: 4,
        name: "Roberto",
        surname: "Díaz",
        email: "roberto.diaz@example.com",
      },
      category: {
        id: 2,
        name: "Electricidad",
      },
      status: "quoted",
      bottleneck: "pending_proposal_24h",
      nextActionBy: "consumer",
      createdAt: "2026-09-21T09:00:00Z",
      updatedAt: "2026-09-22T11:00:00Z",
    });
  });

  it("maps wrapped object responses ({ operations: [...] } and { items: [...] })", () => {
    const wrappedResult = mapOperations({ operations: [sampleSnakeCaseItem] });
    expect(wrappedResult).toHaveLength(1);

    const itemsResult = mapOperations({ items: [sampleCamelCaseItem] });
    expect(itemsResult).toHaveLength(1);
  });

  it("handles numeric IDs by converting them to string", () => {
    const itemWithNumericId = {
      ...sampleSnakeCaseItem,
      id: 999,
    };
    const result = mapOperations([itemWithNumericId]);
    expect(result[0].id).toBe("999");
  });

  it("throws on invalid data", () => {
    expect(() => mapOperations("invalid-string")).toThrow("Invalid operations data");
    expect(() => mapOperations([{ id: 1 }])).toThrow("Invalid operations data");
  });
});
