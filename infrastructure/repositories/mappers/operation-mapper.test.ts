import { describe, expect, it } from "vitest";
import { mapOperations, mapUnifiedOperationDetail } from "./operation-mapper";

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

describe("mapUnifiedOperationDetail", () => {
  const sampleSnakeDetail = {
    id: "op-101",
    status: "in_progress" as const,
    created_at: "2026-09-18T10:00:00Z",
    category: {
      id: 1,
      name: "Plomería",
    },
    consumer: {
      id: 10,
      name: "Ana",
      surname: "Martínez",
      email: "ana.martinez@example.com",
      profile_photo_url: null,
    },
    provider: {
      id: 20,
      name: "Carlos",
      surname: "López",
      email: "carlos.lopez@example.com",
      profile_photo_url: "https://example.com/carlos.jpg",
    },
    current_address: "Av. Corrientes 1234, CABA",
    request: {
      id: 501,
      title: "Reparación de cañería en cocina",
      description: "Pérdida continua de agua bajo la bacha de la cocina.",
      status: "in_progress",
      source_assessment_id: "asm-77",
      diagnostic_summary: "Posible fisura en sifón de desagüe.",
      photos: ["https://example.com/photos/leak-1.jpg"],
    },
    timeline: [
      {
        type: "job_requested",
        title: "Solicitud creada",
        timestamp: "2026-09-18T10:00:00Z",
      },
    ],
  };

  const sampleCamelDetail = {
    id: 102,
    status: "quoted" as const,
    createdAt: "2026-09-19T10:00:00Z",
    category: {
      id: 2,
      name: "Electricidad",
    },
    consumer: {
      id: 11,
      name: "María",
      surname: "Gómez",
      email: "maria.gomez@example.com",
      profilePhotoUrl: "https://example.com/maria.jpg",
    },
    provider: {
      id: 21,
      name: "Roberto",
      surname: "Díaz",
      email: "roberto.diaz@example.com",
    },
    currentAddress: "Belgrano 567, CABA",
    request: {
      id: 502,
      title: "Cortocircuito en disyuntor",
      description: "Salta la térmica al encender el horno eléctrico.",
      status: "quoted",
      sourceAssessmentId: null,
      diagnosticSummary: null,
      photos: [],
    },
    timeline: [],
  };

  it("maps snake_case detail payload correctly", () => {
    const result = mapUnifiedOperationDetail(sampleSnakeDetail);
    expect(result.id).toBe("op-101");
    expect(result.status).toBe("in_progress");
    expect(result.createdAt).toBe("2026-09-18T10:00:00Z");
    expect(result.category).toEqual({ id: 1, name: "Plomería" });
    expect(result.consumer.name).toBe("Ana");
    expect(result.consumer.profilePhotoUrl).toBeNull();
    expect(result.provider.name).toBe("Carlos");
    expect(result.provider.profilePhotoUrl).toBe("https://example.com/carlos.jpg");
    expect(result.currentAddress).toBe("Av. Corrientes 1234, CABA");
    expect(result.request.title).toBe("Reparación de cañería en cocina");
    expect(result.request.sourceAssessmentId).toBe("asm-77");
    expect(result.request.diagnosticSummary).toBe("Posible fisura en sifón de desagüe.");
    expect(result.request.photos).toEqual(["https://example.com/photos/leak-1.jpg"]);
    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0].type).toBe("job_requested");
  });

  it("maps camelCase detail payload and converts numeric id to string", () => {
    const result = mapUnifiedOperationDetail(sampleCamelDetail);
    expect(result.id).toBe("102");
    expect(result.status).toBe("quoted");
    expect(result.category.name).toBe("Electricidad");
    expect(result.consumer.profilePhotoUrl).toBe("https://example.com/maria.jpg");
    expect(result.provider.profilePhotoUrl).toBeNull();
    expect(result.currentAddress).toBe("Belgrano 567, CABA");
    expect(result.timeline).toHaveLength(0);
  });

  it("maps wrapped detail responses ({ operation: ... } and { data: ... })", () => {
    const wrappedOp = mapUnifiedOperationDetail({ operation: sampleSnakeDetail });
    expect(wrappedOp.id).toBe("op-101");

    const wrappedData = mapUnifiedOperationDetail({ data: sampleCamelDetail });
    expect(wrappedData.id).toBe("102");
  });

  it("throws on invalid detail data", () => {
    expect(() => mapUnifiedOperationDetail(null)).toThrow("Invalid operation detail data");
    expect(() => mapUnifiedOperationDetail({ id: "invalid-missing-fields" })).toThrow(
      "Invalid operation detail data",
    );
  });
});

