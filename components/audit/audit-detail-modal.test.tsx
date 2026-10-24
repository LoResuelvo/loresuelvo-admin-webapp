import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditDetailModal } from "./audit-detail-modal";
import type { AuditLogEntry } from "@/domain/audit/audit-log";

const sampleEntry: AuditLogEntry = {
  id: "018f3f3a-8e75-7bc4-9a50-8f512998d110",
  occurredOn: "2026-09-28T14:30:00Z",
  operatorId: 101,
  action: "access",
  resourceType: "operation",
  resourceId: "105",
  reason: "Investigación de reporte por posible fraude",
  correlationId: "trace-001",
  result: "succeeded",
};

describe("AuditDetailModal", () => {
  it("renders nothing when entry is null or modal is closed", () => {
    const { container, rerender } = render(
      <AuditDetailModal isOpen={true} onClose={vi.fn()} entry={null} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<AuditDetailModal isOpen={false} onClose={vi.fn()} entry={sampleEntry} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders only contextual data and correlation ID supplied by the API", () => {
    render(<AuditDetailModal isOpen={true} onClose={vi.fn()} entry={sampleEntry} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Detalle de intervención")).toBeInTheDocument();
    expect(screen.getByText("101")).toBeInTheDocument();
    expect(screen.getByText("Acceso")).toBeInTheDocument();
    expect(screen.getByText("Contratación #105")).toBeInTheDocument();
    expect(screen.getByText("Investigación de reporte por posible fraude")).toBeInTheDocument();
    expect(screen.getByText("Exitoso")).toBeInTheDocument();
    expect(screen.getByText("trace-001")).toBeInTheDocument();

    expect(screen.queryByText("Dirección IP")).not.toBeInTheDocument();
    expect(screen.queryByText("Agente de usuario")).not.toBeInTheDocument();
    expect(screen.queryByText("operador@loresuelvo.com")).not.toBeInTheDocument();
    expect(screen.queryByText(/conversationId/)).not.toBeInTheDocument();
  });

  it("marks optional fields missing from the API as unavailable", () => {
    render(
      <AuditDetailModal
        isOpen={true}
        onClose={vi.fn()}
        entry={{ ...sampleEntry, resourceId: undefined, reason: undefined }}
      />,
    );

    expect(screen.getByText("Contratación — No disponible")).toBeInTheDocument();
    expect(screen.getByText("No disponible")).toBeInTheDocument();
  });

  it("calls onClose when closing the modal", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<AuditDetailModal isOpen={true} onClose={handleClose} entry={sampleEntry} />);

    await user.click(screen.getByRole("button", { name: "Cerrar modal" }));
    expect(handleClose).toHaveBeenCalled();
  });
  it("shows the operator name in context and preserves the ID for traceability", () => {
    render(<AuditDetailModal isOpen onClose={vi.fn()} entry={{...sampleEntry,operatorName:"Sofía López"}} />);
    expect(screen.getByText("Sofía López")).toBeInTheDocument();
    expect(screen.getByText("ID del operador")).toBeInTheDocument();
    expect(screen.getByText("101")).toBeInTheDocument();
  });

});
