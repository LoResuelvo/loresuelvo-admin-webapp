import { describe, expect, it } from "vitest";
import { mapOperations, mapUnifiedOperationDetail } from "./operation-mapper";
import { operation, party } from "./operation-fixtures";
describe("current operations contract", () => {
  it("preserves stable identity, actual stage, nullable evidence and cursor", () => {
    expect(mapOperations({
      operations: [operation],
      next_cursor: "opaque"
    })).toMatchObject({
      operations: [{
          id: "jr-1",
          status: "request_accepted",
          category: null,
          nextActionBy: null,
          updatedAt: null
        }],
      nextCursor: "opaque"
    });
  });
  it("accepts a proposal operation without request or address", () => {
    const detail = {
      id: "sp-8",
      started_on: "2026-09-29T12:00:00Z",
      job_request: null,
      service_proposal: null,
      related_proposals: [],
      work_order: null,
      payment_milestones: [],
      timeline: [],
      consumer: party,
      provider: {
        ...party,
        id: 2
      },
      category: null,
      address: null,
      source_assessment: null
    };
    expect(mapUnifiedOperationDetail(detail)).toMatchObject({
      id: "sp-8",
      request: null,
      category: null,
      currentAddress: null
    });
  });
  it("does not invent contact data or legacy operational alerts", () => {
    const mapped = mapOperations({ operations: [operation], next_cursor: null }).operations[0];
    expect(mapped.consumer).not.toHaveProperty("email");
    expect(mapped).not.toHaveProperty("bottleneck");
    expect(mapped.alerts).toEqual([]);
  });
});
