import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as actions from "@/app/(dashboard)/usuarios/actions";
import { ProviderDiagnosticClient } from "./provider-diagnostic-client";

describe("ProviderDiagnosticClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const sampleDiagnostic = {
    id: 201,
    name: "Juan",
    surname: "Gómez",
    email: "juan@example.com",
    phone: "+54 11 5555-0101",
    profilePhotoUrl: "https://example.com/photo.jpg",
    category: { id: 2, name: "Plomería" },
    coverageZones: [{ id: 6, name: "Comuna 6", isActive: true }],
    identityVerification: {
      status: "approved",
      verifiedAt: "2026-09-15T12:00:00-03:00",
    },
    paymentConnection: {
      isConnected: true,
      accountId: "mp-acc-8812",
      canReceivePayments: true,
    },
    calendarConnection: {
      status: "connected",
    },
  };

  it("loads and renders diagnostic data on success", async () => {
    vi.spyOn(actions, "getProviderDiagnosticAction").mockResolvedValue({
      success: true,
      data: sampleDiagnostic,
    });

    render(<ProviderDiagnosticClient id={201} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByTestId("diagnostic-skeleton")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Juan Gómez" })).toBeInTheDocument();
    });

    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("operational-conditions-panel")).toBeInTheDocument();
  });

  it("renders forbidden message when access is restricted", async () => {
    vi.spyOn(actions, "getProviderDiagnosticAction").mockResolvedValue({
      success: false,
      error: "Acceso restringido",
      isForbidden: true,
    });

    render(<ProviderDiagnosticClient id={201} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/acceso restringido/i);
    });
  });

  it("renders not found message when provider does not exist", async () => {
    vi.spyOn(actions, "getProviderDiagnosticAction").mockResolvedValue({
      success: false,
      error: "No encontrado",
      isNotFound: true,
    });

    render(<ProviderDiagnosticClient id={999} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/no fue encontrado/i);
    });
  });

  it("renders error alert with retry button and reloads on click", async () => {
    const actionSpy = vi
      .spyOn(actions, "getProviderDiagnosticAction")
      .mockResolvedValueOnce({
        success: false,
        error: "Error del servidor",
      })
      .mockResolvedValueOnce({
        success: true,
        data: sampleDiagnostic,
      });

    render(<ProviderDiagnosticClient id={201} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Error del servidor");
    });

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Juan Gómez" })).toBeInTheDocument();
    });

    expect(actionSpy).toHaveBeenCalledTimes(2);
  });
});
