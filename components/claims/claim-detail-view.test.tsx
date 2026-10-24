import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClaimDetailView, type ClaimDetailViewModel } from "./claim-detail-view";

const sampleClaim: ClaimDetailViewModel = {
  id: "101",
  createdAt: "2026-09-24T10:00:00Z",
  operationId: "sp-42",
  claimantType: "consumer",
  claimantId: 10,
  claimantName: "Ana Pérez",
  claimantEmail: "ana@example.com",
  respondentId: 20,
  respondentType: "provider",
  respondentName: "Martín Gómez",
  respondentEmail: "martin@example.com",
  categoryName: "Plomería",
  status: "in_review",
  claimReason: "non_compliance",
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

    expect(screen.getByText(/101/)).toBeInTheDocument();
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(screen.getByText(/Urgencia: No informado/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ana Pérez" })).toHaveAttribute("href", "/usuarios/consumidores/10");
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("ID: 10")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Martín Gómez" })).toHaveAttribute("href", "/usuarios/prestadores/20");
    expect(screen.getByText("martin@example.com")).toBeInTheDocument();
    expect(screen.getByText("ID: 20")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
    expect(screen.getByText("24/09/2026")).toBeInTheDocument();

    expect(screen.getByText("Incumplimiento del servicio")).toBeInTheDocument();
    const description = screen.getByTestId("claim-description");
    expect(description).toHaveTextContent(
      "El prestador se presentó dos horas tarde y exigió un adicional no presupuestado en efectivo.",
    );

    expect(screen.getByTestId("claim-evidence-gallery")).toBeInTheDocument();
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);

    const opLink = screen.getByTestId("operation-link");
    expect(opLink).toHaveAttribute("href", "/operaciones/sp-42");
    expect(opLink).toHaveTextContent("Contratación #sp-42");
  });

  it("links a provider claimant and consumer respondent to their matching profiles", () => {
    const reversedClaim: ClaimDetailViewModel = {
      ...sampleClaim,
      claimantType: "provider",
      claimantId: 20,
      claimantName: "Martín Gómez",
      claimantEmail: "martin@example.com",
      respondentType: "consumer",
      respondentId: 10,
      respondentName: "Ana Pérez",
      respondentEmail: "ana@example.com",
    };

    render(<ClaimDetailView claim={reversedClaim} />);

    expect(screen.getByRole("link", { name: "Martín Gómez" })).toHaveAttribute("href", "/usuarios/prestadores/20");
    expect(screen.getByRole("link", { name: "Ana Pérez" })).toHaveAttribute("href", "/usuarios/consumidores/10");
  });

  it("shows the unavailable fallback when an older API response has no respondent", () => {
    const claimWithoutRespondent: ClaimDetailViewModel = {
      ...sampleClaim,
      respondentId: undefined,
      respondentType: undefined,
      respondentName: undefined,
      respondentEmail: undefined,
    };

    render(<ClaimDetailView claim={claimWithoutRespondent} />);

    expect(screen.getByText("Demandado").parentElement).toHaveTextContent("No informado");
    expect(screen.queryByRole("link", { name: "Martín Gómez" })).not.toBeInTheDocument();
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
