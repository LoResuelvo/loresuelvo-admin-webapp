import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditDetailModal, sanitizeIpAddress } from "./audit-detail-modal";
import type { AuditLogEntry } from "@/domain/audit/audit-log";

const sampleEntry: AuditLogEntry = {
  id: "aud-001",
  timestamp: "2026-09-28T14:30:00Z",
  operatorId: "op-101",
  operatorEmail: "operador@loresuelvo.com",
  action: "chat_access",
  actionLabel: "Acceso a chat privado",
  resourceType: "operation",
  resourceId: "105",
  reason: "Investigación de reporte por posible fraude",
  ipAddress: "192.168.1.50",
  userAgent: "Mozilla/5.0 (Admin Console)",
  status: "success",
  metadata: { conversationId: 105 },
};

describe("sanitizeIpAddress", () => {
  it("obfuscates the last octet of IPv4 addresses", () => {
    expect(sanitizeIpAddress("192.168.1.50")).toBe("192.168.1.xxx");
    expect(sanitizeIpAddress("10.0.0.1")).toBe("10.0.0.xxx");
  });

  it("obfuscates the last segment of IPv6 addresses", () => {
    expect(sanitizeIpAddress("2001:db8::1")).toBe("2001:db8::xxxx");
  });

  it("handles missing or empty ip", () => {
    expect(sanitizeIpAddress(undefined)).toBe("–");
    expect(sanitizeIpAddress("")).toBe("–");
  });
});

describe("AuditDetailModal", () => {
  it("renders nothing when entry is null", () => {
    const { container } = render(
      <AuditDetailModal isOpen={true} onClose={vi.fn()} entry={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <AuditDetailModal isOpen={false} onClose={vi.fn()} entry={sampleEntry} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders contextual information, protected origin and traceability ID", () => {
    render(<AuditDetailModal isOpen={true} onClose={vi.fn()} entry={sampleEntry} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Detalle de intervención")).toBeInTheDocument();

    // Contextual information
    expect(screen.getByText("operador@loresuelvo.com")).toBeInTheDocument();
    expect(screen.getByText("Acceso a chat privado")).toBeInTheDocument();
    expect(screen.getByText("Contratación #105")).toBeInTheDocument();
    expect(screen.getByText("Investigación de reporte por posible fraude")).toBeInTheDocument();
    expect(screen.getByText("Exitoso")).toBeInTheDocument();

    // Protected origin
    expect(screen.getByText("192.168.1.xxx")).toBeInTheDocument();
    expect(screen.queryByText("192.168.1.50")).not.toBeInTheDocument();
    expect(screen.getByText("Mozilla/5.0 (Admin Console)")).toBeInTheDocument();

    // Traceability identifier
    expect(screen.getByText("aud-001")).toBeInTheDocument();

    // Metadata
    expect(screen.getByText(/conversationId/)).toBeInTheDocument();
  });

  it("calls onClose when closing the modal", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<AuditDetailModal isOpen={true} onClose={handleClose} entry={sampleEntry} />);

    const closeBtn = screen.getByRole("button", { name: "Cerrar modal" });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
