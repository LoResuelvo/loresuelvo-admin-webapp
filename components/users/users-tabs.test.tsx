import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UsersTabs } from "./users-tabs";

describe("UsersTabs", () => {
  it("renders consumers and providers tabs with appropriate aria-selected attributes", () => {
    render(<UsersTabs activeTab="consumers" />);

    const consumersTab = screen.getByRole("tab", { name: "Consumidores" });
    const providersTab = screen.getByRole("tab", { name: "Prestadores" });

    expect(consumersTab).toHaveAttribute("aria-selected", "true");
    expect(providersTab).toHaveAttribute("aria-selected", "false");
  });

  it("calls onTabChange when clicking providers tab", async () => {
    const onTabChange = vi.fn();
    render(<UsersTabs activeTab="consumers" onTabChange={onTabChange} />);

    const providersTab = screen.getByRole("tab", { name: "Prestadores" });
    await userEvent.click(providersTab);

    expect(onTabChange).toHaveBeenCalledWith("providers");
  });
});
