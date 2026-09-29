import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewStatusTabs } from "./review-status-tabs";

describe("ReviewStatusTabs", () => {
  it("renders all tabs in tablist", () => {
    render(<ReviewStatusTabs onStatusChange={vi.fn()} />);

    expect(screen.getByRole("tablist", { name: "Filtrar por estado" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Todas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Reportadas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Ocultadas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Visibles" })).toBeInTheDocument();
  });

  it("marks the current active tab as selected", () => {
    render(<ReviewStatusTabs currentStatus="hidden" onStatusChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: "Ocultadas" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Todas" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Reportadas" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Visibles" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onStatusChange with corresponding status when clicking tabs", async () => {
    const handleStatusChange = vi.fn();
    const user = userEvent.setup();

    render(<ReviewStatusTabs onStatusChange={handleStatusChange} />);

    await user.click(screen.getByRole("tab", { name: "Ocultadas" }));
    expect(handleStatusChange).toHaveBeenCalledWith("hidden");

    await user.click(screen.getByRole("tab", { name: "Reportadas" }));
    expect(handleStatusChange).toHaveBeenCalledWith("reported");

    await user.click(screen.getByRole("tab", { name: "Visibles" }));
    expect(handleStatusChange).toHaveBeenCalledWith("visible");

    await user.click(screen.getByRole("tab", { name: "Todas" }));
    expect(handleStatusChange).toHaveBeenCalledWith(undefined);
  });
});
