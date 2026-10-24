import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperationHeader, type OperationHeaderProps } from "./operation-header";

describe("OperationHeader", () => {
  const defaultProps: OperationHeaderProps = {
    id: "op-101",
    status: "in_progress",
    category: {
      id: 1,
      name: "Plomería",
    },
    consumer: {
      id: 10,
      name: "Ana",
      surname: "Martínez",
      email: "ana.martinez@example.com",
      profilePhotoUrl: null,
    },
    provider: {
      id: 20,
      name: "Carlos",
      surname: "López",
      email: "carlos.lopez@example.com",
      profilePhotoUrl: "https://example.com/carlos.jpg",
    },
    currentAddress: "Av. Corrientes 1234, CABA",
  };

  it("renders customer contact information", () => {
    render(<OperationHeader {...defaultProps} />);
    expect(screen.getByText("Ana Martínez")).toBeInTheDocument();
    expect(screen.getByText("ana.martinez@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ana Martínez" })).toHaveAttribute("href", "/usuarios/consumidores/10");
  });

  it("omits an unavailable email while keeping the profile link", () => {
    render(<OperationHeader {...defaultProps} consumer={{ ...defaultProps.consumer, email: null }} />);

    expect(screen.getByRole("link", { name: "Ana Martínez" })).toHaveAttribute("href", "/usuarios/consumidores/10");
    expect(screen.queryByText("Información no disponible")).not.toBeInTheDocument();
  });

  it("shows an overdue schedule warning when the detail provides one", () => {
    render(<OperationHeader {...defaultProps} overdueScheduledDate="25/09/2026, 06:00" overdueOrderStatus="Programada" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Revisar fecha programada");
    expect(screen.getByRole("alert")).toHaveTextContent("La fecha prevista 25/09/2026, 06:00 ya pasó. Estado actual de la orden: Programada.");
  });

  it("renders provider contact information and photo", () => {
    render(<OperationHeader {...defaultProps} />);
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
    expect(screen.getByText("carlos.lopez@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carlos López" })).toHaveAttribute("href", "/usuarios/prestadores/20");
    const photo = screen.getByAltText("Carlos López");
    expect(photo).toHaveAttribute("src", "https://example.com/carlos.jpg");
  });

  it("renders category name and registered address", () => {
    render(<OperationHeader {...defaultProps} />);
    expect(screen.getByText("Plomería")).toBeInTheDocument();
    expect(screen.getByText("Av. Corrientes 1234, CABA")).toBeInTheDocument();
  });

  it("renders operation status badge with translated label", () => {
    render(<OperationHeader {...defaultProps} />);
    expect(screen.getByText("En progreso")).toBeInTheDocument();
  });

  it("renders container with data-testid operation-header", () => {
    render(<OperationHeader {...defaultProps} />);
    expect(screen.getByTestId("operation-header")).toBeInTheDocument();
  });

  it("renders inspect chat button and calls onInspectChat when clicked", () => {
    const handleInspect = vi.fn();
    render(<OperationHeader {...defaultProps} onInspectChat={handleInspect} />);

    const button = screen.getByTestId("inspect-chat-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Inspeccionar conversación");

    button.click();
    expect(handleInspect).toHaveBeenCalledTimes(1);
  });
});
