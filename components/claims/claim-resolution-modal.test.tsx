import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClaimResolutionModal } from "./claim-resolution-modal";

describe("ClaimResolutionModal", () => {
  it("renders form elements properly when open", () => {
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dictamen de Resolución de Mediación" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de resolución")).toBeInTheDocument();
    expect(screen.getByLabelText("Motivo justificado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar dictamen" })).toBeInTheDocument();
  });

  it("validates that reason is required and shows error without submitting", async () => {
    const onSubmit = vi.fn();
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Confirmar dictamen" });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("El motivo de resolución es obligatorio");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("validates that whitespace-only reason is rejected", async () => {
    const onSubmit = vi.fn();
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("Motivo justificado");
    await userEvent.type(input, "   ");

    const submitButton = screen.getByRole("button", { name: "Confirmar dictamen" });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("El motivo de resolución es obligatorio");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits with valid data when filled properly", async () => {
    const onSubmit = vi.fn();
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const select = screen.getByLabelText("Tipo de resolución");
    await userEvent.selectOptions(select, "favor_consumer");

    const textarea = screen.getByLabelText("Motivo justificado");
    await userEvent.type(textarea, "Incumplimiento de visita pactada sin aviso previo");

    const submitButton = screen.getByRole("button", { name: "Confirmar dictamen" });
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      resolutionType: "favor_consumer",
      reason: "Incumplimiento de visita pactada sin aviso previo",
      compensationAmountCents: null,
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows loading state when isSubmitting is true", () => {
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Registrando..." });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    expect(cancelButton).toBeDisabled();
  });

  it("displays external error message when provided", () => {
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        error="Error al registrar la resolución"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Error al registrar la resolución");
  });

  it("clears validation error when user begins typing in reason field", async () => {
    const onSubmit = vi.fn();
    render(<ClaimResolutionModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "Confirmar dictamen" });
    await userEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent("El motivo de resolución es obligatorio");

    const input = screen.getByLabelText("Motivo justificado");
    await userEvent.type(input, "Se llegó a un acuerdo");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders retry button inside error alert when error is present", () => {
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        error="Inconveniente con el servidor de soporte"
      />
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Inconveniente con el servidor de soporte");
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("calls onRetry callback when retry button is clicked", async () => {
    const onRetry = vi.fn();
    render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        error="Inconveniente temporal"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await userEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("re-submits form data when retry button is clicked without onRetry callback", async () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("Motivo justificado");
    await userEvent.type(input, "Demora no justificada");

    rerender(
      <ClaimResolutionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        error="Error en el servidor"
      />
    );

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await userEvent.click(retryButton);

    expect(onSubmit).toHaveBeenCalledWith({
      resolutionType: "favor_consumer",
      reason: "Demora no justificada",
      compensationAmountCents: null,
    });
  });
});

