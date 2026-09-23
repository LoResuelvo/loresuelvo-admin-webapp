import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OperationsFilterBar } from "./operations-filter-bar";

describe("OperationsFilterBar", () => {
  it("renders bottleneck filter combobox with default label and options", () => {
    render(<OperationsFilterBar />);

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todas las alertas" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Estancada > 24h" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Propuesta demorada > 24h" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Al día" })).toBeInTheDocument();
  });

  it("reflects the selectedBottleneck prop value", () => {
    render(<OperationsFilterBar selectedBottleneck="stalled" />);

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" }) as HTMLSelectElement;
    expect(select.value).toBe("stalled");
  });

  it("calls onBottleneckChange when a bottleneck option is selected", async () => {
    const user = userEvent.setup();
    const handleBottleneckChange = vi.fn();
    render(<OperationsFilterBar onBottleneckChange={handleBottleneckChange} />);

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" });
    await user.selectOptions(select, "stalled");

    expect(handleBottleneckChange).toHaveBeenCalledWith("stalled");
  });
});
