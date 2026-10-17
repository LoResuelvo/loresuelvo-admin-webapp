import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeactivateCategoryModal } from "./deactivate-category-modal";

describe("DeactivateCategoryModal", () => {
  const sampleCategory = { id: 1, name: "Cerrajería", enabled: true, version: 2 };
  const favorableImpact = {
    categoryId: 1,
    categoryName: "Cerrajería",
    observedAt: "2026-10-15T12:00:00Z",
    counts: {
      assignedProviders: 3,
      pendingRequests: 0,
      acceptedRequestsWithoutProposal: 0,
      pendingProposals: 0,
      scheduledOrders: 0,
      awaitingPaymentOrders: 0,
    },
    hasOngoingOrders: false,
    requiresConfirmation: false,
    existingOperationsCanContinue: true,
    providerCount: 3,
    activeOrdersCount: 0,
  };
  const blockedImpact = {
    categoryId: 2,
    categoryName: "Electricidad",
    observedAt: "2026-10-15T12:00:00Z",
    counts: {
      assignedProviders: 5,
      pendingRequests: 0,
      acceptedRequestsWithoutProposal: 0,
      pendingProposals: 0,
      scheduledOrders: 1,
      awaitingPaymentOrders: 1,
    },
    hasOngoingOrders: true,
    requiresConfirmation: true,
    existingOperationsCanContinue: true,
    providerCount: 5,
    activeOrdersCount: 2,
  };

  it("renders modal with favorable impact notice and enabled confirm button", () => {
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={sampleCategory}
        impact={favorableImpact}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Desactivar rubro" })).toBeInTheDocument();
    expect(screen.getByText(/Existen 3 prestadores con este rubro asignado/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar desactivación" })).toBeInTheDocument();
  });

  it("renders loading indicator when isLoadingImpact is true", () => {
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={sampleCategory}
        impact={null}
        isLoadingImpact={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Evaluando impacto en prestadores y órdenes..."
    );
  });

  it("warns about ongoing orders and requires explicit confirmation", async () => {
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={{ id: 2, name: "Electricidad", enabled: true, version: 1 }}
        impact={blockedImpact}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Hay 2 órdenes programadas o pendientes de pago"
    );
    const confirmButton = screen.getByRole("button", { name: "Confirmar desactivación" });
    expect(confirmButton).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Motivo de desactivación"), "Cierre solicitado");
    expect(confirmButton).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Confirmo la desactivación aunque existan órdenes en curso"));
    expect(confirmButton).toBeEnabled();
  });

  it("sends version, reason and explicit confirmation when confirming", async () => {
    const onConfirm = vi.fn();
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={sampleCategory}
        impact={favorableImpact}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByRole("button", { name: "Confirmar desactivación" });
    await userEvent.type(screen.getByLabelText("Motivo de desactivación"), "Cierre del rubro");
    await userEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(1, 2, "Cierre del rubro", false);
  });

  it("closes modal on cancel click", async () => {
    const onClose = vi.fn();
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={sampleCategory}
        impact={favorableImpact}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    await userEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows submitting state when isSubmitting is true", () => {
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={sampleCategory}
        impact={favorableImpact}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Desactivando..." });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");
  });
});
