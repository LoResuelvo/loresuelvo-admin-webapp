import { describe, expect, it } from "vitest";
import { formatAuditDateTime, formatAuditResource } from "./audit-formatters";

describe("audit presentation", () => {
  it("shows the Argentina date and zone when UTC falls on the next day", () => {
    const value = formatAuditDateTime("2026-10-23T01:15:00Z");
    expect(value).toContain("22/10/2026");
    expect(value).toContain("22:15");
    expect(value).toContain("Argentina");
  });

  it.each([
    ["service_proposal", "Propuesta"],
    ["job_request", "Solicitud"],
    ["consumer", "Cliente"],
    ["audit_log", "Registro de auditoría"],
  ])("names %s in Spanish while preserving its reference", (kind, label) => {
    expect(formatAuditResource(kind, "42", "No disponible")).toBe(`${label} #42`);
  });

  it("labels unknown resource kinds without exposing internal codes", () => {
    expect(formatAuditResource("future_internal_kind", "42", "No disponible")).toBe("Recurso #42");
  });
});
