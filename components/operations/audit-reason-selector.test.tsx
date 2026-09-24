import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditReasonSelector } from "./audit-reason-selector";

describe("AuditReasonSelector", () => {
  it("renders select with label and all predefined reasons", () => {
    render(<AuditReasonSelector value="" onChange={vi.fn()} />);

    expect(screen.getByLabelText(/causa de la consulta/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Reclamo de cliente" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Disputa de pago" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Demora en el servicio" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Investigación de soporte" })).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<AuditReasonSelector value="" onChange={handleChange} />);

    await user.selectOptions(screen.getByRole("combobox"), "Reclamo de cliente");
    expect(handleChange).toHaveBeenCalledWith("Reclamo de cliente");
  });

  it("displays validation error message when error prop is provided", () => {
    render(
      <AuditReasonSelector
        value=""
        onChange={vi.fn()}
        error="Debes seleccionar una causa para poder continuar"
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Debes seleccionar una causa para poder continuar");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });
});
