import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
      hasMore: false,
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

  it("loads the next cursor page without losing earlier interactions", async () => {
    const firstPage = {
      ...sampleConsumerDetail,
      history: Array.from({ length: 20 }, (_, index) => ({
        resourceId: index + 1,
        operationId: index + 1,
        resourceType: "work_order",
        categoryName: `Rubro ${index + 1}`,
        provider: { id: 201, name: `Prestador ${index + 1}` },
        status: "paid",
        totalAmountCents: 12000,
        createdAt: "2026-09-20T10:00:00-03:00",
      })),
      pagination: {
        limit: 20,
        hasMore: true,
        nextCursor: "opaque-cursor-page-2",
      },
    };
    const secondPage = {
      ...sampleConsumerDetail,
      history: [
        {
          resourceId: 20,
          operationId: 20,
          resourceType: "work_order",
          categoryName: "Duplicada 20",
          provider: { id: 220, name: "Prestador duplicado" },
          status: "paid",
          totalAmountCents: 15000,
          createdAt: "2026-09-21T10:00:00-03:00",
        },
        {
          resourceId: 21,
          operationId: 21,
          resourceType: "work_order",
          categoryName: "Rubro 21",
          provider: { id: 221, name: "Prestador 21" },
          status: "paid",
          totalAmountCents: 15000,
          createdAt: "2026-09-21T10:00:00-03:00",
        },
      ],
      pagination: { limit: 20, hasMore: false },
    };
    const actionSpy = vi
      .spyOn(actions, "getConsumerHistoryAction")
      .mockResolvedValueOnce({ success: true, data: firstPage })
      .mockResolvedValueOnce({ success: true, data: secondPage });

    render(<ConsumerHistoryClient id={301} />);

    await screen.findByText("Rubro 20");
    await userEvent.click(
      screen.getByRole("button", { name: "Cargar más interacciones" }),
    );

    await screen.findByText("Rubro 21");
    expect(screen.getByText("Rubro 1")).toBeInTheDocument();
    expect(screen.queryByText("Duplicada 20")).not.toBeInTheDocument();
    expect(actionSpy).toHaveBeenNthCalledWith(2, 301, {
      limit: 20,
      cursor: "opaque-cursor-page-2",
    });
  });

  it("does not request the same cursor twice when load more is double-clicked", async () => {
    const firstPage = {
      ...sampleConsumerDetail,
      history: [
        {
          resourceId: 20,
          operationId: 20,
          resourceType: "work_order",
          categoryName: "Rubro 20",
          provider: { id: 220, name: "Prestador 20" },
          status: "paid",
          totalAmountCents: 15000,
          createdAt: "2026-09-21T10:00:00-03:00",
        },
      ],
      pagination: { limit: 20, hasMore: true, nextCursor: "same-cursor" },
    };
    const nextPage = {
      ...sampleConsumerDetail,
      history: [],
      pagination: { limit: 20, hasMore: false },
    };
    let resolveNextPage:
      | ((result: Awaited<ReturnType<typeof actions.getConsumerHistoryAction>>) => void)
      | undefined;
    const actionSpy = vi
      .spyOn(actions, "getConsumerHistoryAction")
      .mockResolvedValueOnce({ success: true, data: firstPage })
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveNextPage = resolve; }),
      );

    render(<ConsumerHistoryClient id={301} />);
    await screen.findByText("Rubro 20");
    const loadMoreButton = screen.getByRole("button", {
      name: "Cargar más interacciones",
    });

    act(() => {
      fireEvent.click(loadMoreButton);
      fireEvent.click(loadMoreButton);
    });

    expect(actionSpy).toHaveBeenCalledTimes(2);
    expect(actionSpy).toHaveBeenNthCalledWith(2, 301, {
      limit: 20,
      cursor: "same-cursor",
    });

    await act(async () => {
      resolveNextPage?.({ success: true, data: nextPage });
    });
    expect(screen.getByText("Rubro 20")).toBeInTheDocument();
  });

  it("keeps loaded interactions visible and retries a failed next page", async () => {
    const firstPage = {
      ...sampleConsumerDetail,
      history: [
        {
          resourceId: 20,
          operationId: 20,
          resourceType: "work_order",
          categoryName: "Rubro 20",
          provider: { id: 220, name: "Prestador 20" },
          status: "paid",
          totalAmountCents: 15000,
          createdAt: "2026-09-21T10:00:00-03:00",
        },
      ],
      pagination: { limit: 20, hasMore: true, nextCursor: "retry-cursor" },
    };
    const nextPage = {
      ...sampleConsumerDetail,
      history: [
        {
          resourceId: 21,
          operationId: 21,
          resourceType: "work_order",
          categoryName: "Rubro 21",
          provider: { id: 221, name: "Prestador 21" },
          status: "paid",
          totalAmountCents: 16000,
          createdAt: "2026-09-22T10:00:00-03:00",
        },
      ],
      pagination: { limit: 20, hasMore: false },
    };
    const actionSpy = vi
      .spyOn(actions, "getConsumerHistoryAction")
      .mockResolvedValueOnce({ success: true, data: firstPage })
      .mockResolvedValueOnce({ success: false, error: "No se pudo cargar la siguiente página" })
      .mockResolvedValueOnce({ success: true, data: nextPage });

    render(<ConsumerHistoryClient id={301} />);
    await screen.findByText("Rubro 20");
    await userEvent.click(screen.getByRole("button", {
      name: "Cargar más interacciones",
    }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar la siguiente página",
    );
    expect(screen.getByText("Rubro 20")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Rubro 21")).toBeInTheDocument();
    expect(screen.getByText("Rubro 20")).toBeInTheDocument();
    expect(actionSpy).toHaveBeenNthCalledWith(2, 301, {
      limit: 20,
      cursor: "retry-cursor",
    });
    expect(actionSpy).toHaveBeenNthCalledWith(3, 301, {
      limit: 20,
      cursor: "retry-cursor",
    });
  });

  it("keeps filters available after an empty server result and resets them", async () => {
    const historyPage = {
      ...sampleConsumerDetail,
      history: [
        {
          resourceId: 105,
          operationId: "jr-105",
          resourceType: "work_order",
          categoryName: "Plomería",
          provider: { id: 201, name: "Juan Gómez" },
          status: "paid",
          totalAmountCents: 2000000,
          createdAt: "2026-09-20T10:00:00-03:00",
        },
      ],
      pagination: { limit: 20, hasMore: false },
    };
    const emptyFilteredPage = {
      ...sampleConsumerDetail,
      history: [],
      pagination: { limit: 20, hasMore: false },
    };
    const actionSpy = vi
      .spyOn(actions, "getConsumerHistoryAction")
      .mockResolvedValueOnce({ success: true, data: historyPage })
      .mockResolvedValueOnce({ success: true, data: historyPage })
      .mockResolvedValueOnce({ success: true, data: emptyFilteredPage })
      .mockResolvedValueOnce({ success: true, data: historyPage });

    render(<ConsumerHistoryClient id={301} />);

    await screen.findByText("Plomería");
    const typeFilter = screen.getByRole("combobox", { name: "Tipo de interacción" });
    await userEvent.selectOptions(typeFilter, "work_order");
    await waitFor(() => {
      expect(actionSpy).toHaveBeenNthCalledWith(2, 301, {
        limit: 20,
        resourceType: "work_order",
      });
    });

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Estado" }),
      "paid",
    );
    await screen.findByText(
      "No se encontraron interacciones con los filtros seleccionados",
    );
    await waitFor(() => {
      expect(actionSpy).toHaveBeenNthCalledWith(3, 301, {
        limit: 20,
        resourceType: "work_order",
        status: "paid",
      });
    });

    expect(
      screen.getByRole("combobox", { name: "Tipo de interacción" }),
    ).toBeInTheDocument();
    await userEvent.selectOptions(typeFilter, "all");
    await waitFor(() => {
      expect(actionSpy).toHaveBeenNthCalledWith(4, 301, { limit: 20 });
    });
    await screen.findByText("Plomería");
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
