import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateCategoryModal } from "./create-category-modal";

describe("CreateCategoryModal", () => {
  it("renders form elements properly when open", () => {
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nuevo rubro" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del rubro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear rubro" })).toBeInTheDocument();
  });

  it("validates that name is required and shows error without submitting", async () => {
    const onSubmit = vi.fn();
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Crear rubro" });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("El nombre es obligatorio");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("validates that whitespace-only name is rejected", async () => {
    const onSubmit = vi.fn();
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.type(input, "   ");

    const submitButton = screen.getByRole("button", { name: "Crear rubro" });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("El nombre es obligatorio");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed name when valid", async () => {
    const onSubmit = vi.fn();
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.type(input, "  Plomería  ");

    const submitButton = screen.getByRole("button", { name: "Crear rubro" });
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith("Plomería");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows loading state and disables buttons when isSubmitting is true", () => {
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Creando rubro..." });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    expect(cancelButton).toBeDisabled();

    const input = screen.getByLabelText("Nombre del rubro");
    expect(input).toBeDisabled();
  });

  it("displays external error message when provided", () => {
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        error="El rubro ya existe"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("El rubro ya existe");
  });

  it("preserves entered name when duplicate error is displayed", async () => {
    const { rerender } = render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.type(input, "Plomería");

    rerender(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        error="El rubro ya existe"
      />
    );

    expect(input).toHaveValue("Plomería");
    expect(screen.getByRole("alert")).toHaveTextContent("El rubro ya existe");
  });

  it("preserves entered name when forbidden error is displayed", async () => {
    const { rerender } = render(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.type(input, "Plomería");

    rerender(
      <CreateCategoryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        error="No tenés permisos para realizar esta acción"
      />
    );

    expect(input).toHaveValue("Plomería");
    expect(screen.getByRole("alert")).toHaveTextContent("No tenés permisos para realizar esta acción");
  });
});
