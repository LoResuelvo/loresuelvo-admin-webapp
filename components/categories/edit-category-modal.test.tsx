import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditCategoryModal } from "./edit-category-modal";

describe("EditCategoryModal", () => {
  const sampleCategory = { id: 1, name: "Plomería" };

  it("renders form elements properly with pre-filled name when open", () => {
    render(
      <EditCategoryModal
        isOpen={true}
        category={sampleCategory}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editar rubro" })).toBeInTheDocument();
    const input = screen.getByLabelText("Nombre del rubro");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Plomería");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });

  it("validates that name is required and shows error without submitting", async () => {
    const onSubmit = vi.fn();
    render(
      <EditCategoryModal
        isOpen={true}
        category={sampleCategory}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.clear(input);

    const submitButton = screen.getByRole("button", { name: "Guardar cambios" });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("El nombre es obligatorio");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
  });

  it("validates that whitespace-only name is rejected", async () => {
    const onSubmit = vi.fn();
    render(
      <EditCategoryModal
        isOpen={true}
        category={sampleCategory}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.clear(input);
    await userEvent.type(input, "   ");

    const submitButton = screen.getByRole("button", { name: "Guardar cambios" });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("El nombre es obligatorio");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits category id and trimmed name when valid", async () => {
    const onSubmit = vi.fn();
    render(
      <EditCategoryModal
        isOpen={true}
        category={sampleCategory}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.clear(input);
    await userEvent.type(input, "  Instalaciones Sanitarias  ");

    const submitButton = screen.getByRole("button", { name: "Guardar cambios" });
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(1, "Instalaciones Sanitarias");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows loading state and disables buttons when isSubmitting is true", () => {
    render(
      <EditCategoryModal
        isOpen={true}
        category={sampleCategory}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Guardando cambios..." });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    expect(cancelButton).toBeDisabled();

    const input = screen.getByLabelText("Nombre del rubro");
    expect(input).toBeDisabled();
  });

  it("displays external error message when provided", () => {
    render(
      <EditCategoryModal
        isOpen={true}
        category={sampleCategory}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        error="El rubro ya existe"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("El rubro ya existe");
  });

  it("closes modal when clicking Cancelar button", async () => {
    const onClose = vi.fn();
    render(
      <EditCategoryModal
        isOpen={true}
        category={sampleCategory}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    await userEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
