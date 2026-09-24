import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeactivateCategoryModal } from "./deactivate-category-modal";

describe("DeactivateCategoryModal", () => {
  const sampleCategory = { id: 1, name: "Cerrajería", enabled: true };
  const favorableImpact = {
    categoryId: 1,
    categoryName: "Cerrajería",
    providerCount: 3,
    activeOrdersCount: 0,
    canDeactivate: true,
  };
  const blockedImpact = {
    categoryId: 2,
    categoryName: "Electricidad",
    providerCount: 5,
    activeOrdersCount: 2,
    canDeactivate: false,
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

  it("renders blocking alert and hides confirm button when active orders exist", () => {
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={{ id: 2, name: "Electricidad", enabled: true }}
        impact={blockedImpact}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No es posible desactivar este rubro porque registra 2 órdenes de trabajo activas en curso"
    );
    expect(screen.queryByRole("button", { name: "Confirmar desactivación" })).not.toBeInTheDocument();
  });

  it("calls onConfirm with category id when confirming", async () => {
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
    await userEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(1);
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
