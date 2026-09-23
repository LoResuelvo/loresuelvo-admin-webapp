import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationRequestCard } from "./operation-request-card";
import type { RequestDetail } from "@/domain/operations/unified-operation-detail";

describe("OperationRequestCard", () => {
  const sampleRequestWithAi: RequestDetail = {
    id: 501,
    title: "Reparación de cañería en cocina",
    description: "Pérdida continua de agua bajo la bacha de la cocina.",
    status: "in_progress",
    sourceAssessmentId: "asm-77",
    diagnosticSummary: "Posible fisura en sifón de desagüe con goteo constante.",
    photos: ["https://example.com/photos/leak-1.jpg", "https://example.com/photos/leak-2.jpg"],
  };

  const sampleRequestWithoutAi: RequestDetail = {
    id: 502,
    title: "Cambio de toma corriente",
    description: "Enchufe quemado en living.",
    status: "quoted",
    sourceAssessmentId: null,
    diagnosticSummary: null,
    photos: [],
  };

  it("renders container with data-testid operation-request-card", () => {
    render(<OperationRequestCard request={sampleRequestWithAi} />);
    expect(screen.getByTestId("operation-request-card")).toBeInTheDocument();
  });

  it("renders title and description", () => {
    render(<OperationRequestCard request={sampleRequestWithAi} />);
    expect(screen.getByText("Reparación de cañería en cocina")).toBeInTheDocument();
    expect(
      screen.getByText("Pérdida continua de agua bajo la bacha de la cocina."),
    ).toBeInTheDocument();
  });

  it("renders AI diagnostic summary and assistant indicator", () => {
    render(<OperationRequestCard request={sampleRequestWithAi} />);
    expect(
      screen.getByText("Posible fisura en sifón de desagüe con goteo constante."),
    ).toBeInTheDocument();
    expect(screen.getByText(/diagnóstico asistido por ia|asistente/i)).toBeInTheDocument();
    expect(screen.getByText(/asm-77/)).toBeInTheDocument();
  });

  it("renders photo gallery with attached photos", () => {
    render(<OperationRequestCard request={sampleRequestWithAi} />);
    const photos = screen.getAllByTestId("request-photo");
    expect(photos).toHaveLength(2);
    expect(photos[0]).toHaveAttribute("src", "https://example.com/photos/leak-1.jpg");
    expect(photos[1]).toHaveAttribute("src", "https://example.com/photos/leak-2.jpg");
  });

  it("does not render AI diagnostic banner when not present", () => {
    render(<OperationRequestCard request={sampleRequestWithoutAi} />);
    expect(screen.queryByText(/diagnóstico asistido por ia/i)).not.toBeInTheDocument();
  });
});
