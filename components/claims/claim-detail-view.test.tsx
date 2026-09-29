import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClaimDetailView, type ClaimDetailViewModel } from "./claim-detail-view";

const sampleClaim: ClaimDetailViewModel = {
  id: "clm-101",
  createdAt: "2026-09-24T10:00:00Z",
  operationId: 42,
  claimantType: "consumer",
  claimantName: "Ana Gómez",
  respondentName: "Carlos López",
  categoryName: "Plomería",
  status: "in_review",
  urgency: "high",
  claimReason: "Incumplimiento de horario y cobro indebido",
  description: "El prestador se presentó dos horas tarde y exigió un adicional no presupuestado en efectivo.",
  evidencePhotoUrls: [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg",
  ],
  resolution: null,
};

describe("ClaimDetailView", () => {
  it("renders header, parties, conflict description, evidences, and operation link", () => {
    render(<ClaimDetailView claim={sampleClaim} />);

    expect(screen.getByText(/clm-101/)).toBeInTheDocument();
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(screen.getByText(/Alta/)).toBeInTheDocument();
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
    expect(screen.getByText("24/09/2026")).toBeInTheDocument();

    expect(screen.getByText("Incumplimiento de horario y cobro indebido")).toBeInTheDocument();
    const description = screen.getByTestId("claim-description");
    expect(description).toHaveTextContent(
      "El prestador se presentó dos horas tarde y exigió un adicional no presupuestado en efectivo.",
    );

    expect(screen.getByTestId("claim-evidence-gallery")).toBeInTheDocument();
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);

    const opLink = screen.getByTestId("operation-link");
    expect(opLink).toHaveAttribute("href", "/operaciones/42");
    expect(opLink).toHaveTextContent("Contratación #42");
  });

  it("renders resolve button and triggers onOpenResolutionModal", async () => {
    const onOpen = vi.fn();
    render(<ClaimDetailView claim={sampleClaim} onOpenResolutionModal={onOpen} />);

    const button = screen.getByRole("button", { name: "Dictaminar resolución" });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders success banner when successMessage is passed", () => {
    render(
      <ClaimDetailView
        claim={sampleClaim}
        successMessage="Dictamen registrado con éxito"
      />,
    );

    expect(screen.getByTestId("claim-resolution-success")).toHaveTextContent(
      "Dictamen registrado con éxito",
    );
  });

  it("renders resolution card when resolution details are present", () => {
    const resolvedClaim: ClaimDetailViewModel = {
      ...sampleClaim,
      status: "resolved",
      resolution: {
        resolutionType: "favor_consumer",
        reason: "Incumplimiento verificado",
      },
    };

    render(<ClaimDetailView claim={resolvedClaim} />);

    expect(screen.getByTestId("claim-resolution-card")).toBeInTheDocument();
    expect(screen.getByText("A favor del cliente")).toBeInTheDocument();
    expect(screen.getByText("Incumplimiento verificado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dictaminar resolución" })).not.toBeInTheDocument();
  });
});
