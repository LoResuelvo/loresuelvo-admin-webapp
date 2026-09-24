import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as actions from "@/app/(dashboard)/usuarios/actions";
import { ConsumerHistoryClient } from "./consumer-history-client";

describe("ConsumerHistoryClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const sampleConsumerDetail = {
    id: 301,
    name: "Carlos",
    surname: "López",
    email: "carlos@example.com",
    phone: "+54 11 4444-2222",
    profilePhotoUrl: "https://example.com/photo.jpg",
    registeredAt: "2026-09-01T10:00:00-03:00",
    currentAddress: "Av. Rivadavia 4500",
    coverageZone: { id: 6, name: "Comuna 6" },
    history: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  };

  it("loads and renders consumer detail data on success", async () => {
    vi.spyOn(actions, "getConsumerHistoryAction").mockResolvedValue({
      success: true,
      data: sampleConsumerDetail,
    });

    render(<ConsumerHistoryClient id={301} />);

    const skeleton = screen.getByTestId("consumer-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Carlos López" })).toBeInTheDocument();
    });

    expect(screen.getByText("carlos@example.com")).toBeInTheDocument();
    expect(screen.getByText("Av. Rivadavia 4500")).toBeInTheDocument();
  });

  it("renders forbidden message when access is restricted", async () => {
    vi.spyOn(actions, "getConsumerHistoryAction").mockResolvedValue({
      success: false,
      error: "Acceso restringido",
      isForbidden: true,
    });

    render(<ConsumerHistoryClient id={301} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/acceso restringido/i);
    });
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it("renders not found message when consumer does not exist", async () => {
    vi.spyOn(actions, "getConsumerHistoryAction").mockResolvedValue({
      success: false,
      error: "No encontrado",
      isNotFound: true,
    });

    render(<ConsumerHistoryClient id={999} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/no fue encontrado/i);
    });
    expect(screen.getByTestId("consumer-not-found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver a usuarios/i })).toHaveAttribute(
      "href",
      "/usuarios",
    );
  });

  it("renders error alert with retry button and reloads on click", async () => {
    const actionSpy = vi
      .spyOn(actions, "getConsumerHistoryAction")
      .mockResolvedValueOnce({
        success: false,
        error: "Error del servidor",
      })
      .mockResolvedValueOnce({
        success: true,
        data: sampleConsumerDetail,
      });

    render(<ConsumerHistoryClient id={301} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Error del servidor");
    });

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Carlos López" })).toBeInTheDocument();
    });

    expect(actionSpy).toHaveBeenCalledTimes(2);
  });

  it("renders default translation error when action throws", async () => {
    vi.spyOn(actions, "getConsumerHistoryAction").mockRejectedValue(new Error("Network failed"));

    render(<ConsumerHistoryClient id={301} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/error/i);
    });
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });
});
