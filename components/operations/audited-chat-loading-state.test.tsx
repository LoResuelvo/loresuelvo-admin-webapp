import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuditedChatLoadingState } from "./audited-chat-loading-state";

describe("AuditedChatLoadingState", () => {
  it("renders status indicator and translated loading text", () => {
    render(<AuditedChatLoadingState />);

    const statusContainer = screen.getByRole("status");
    expect(statusContainer).toBeInTheDocument();
    expect(statusContainer).toHaveAttribute("data-testid", "audited-chat-loading");
    expect(statusContainer).toHaveTextContent(/recuperando conversación/i);
  });
});
