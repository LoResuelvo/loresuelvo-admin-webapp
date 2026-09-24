import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditedChatDialog } from "./audited-chat-dialog";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";

describe("AuditedChatDialog", () => {
  const sampleResult: AuditedConversationResult = {
    items: [
      {
        id: 1,
        senderId: 10,
        senderRole: "consumer",
        content: "Hola mundo",
        sentAt: "2026-09-18T10:15:00Z",
        attachments: [],
      },
    ],
    total: 1,
  };

  it("does not render when isOpen is false", () => {
    render(
      <AuditedChatDialog
        isOpen={false}
        onClose={vi.fn()}
        operationId="op-101"
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows validation error when attempting to confirm without selecting a reason", async () => {
    const user = userEvent.setup();
    render(
      <AuditedChatDialog
        isOpen={true}
        onClose={vi.fn()}
        operationId="op-101"
      />,
    );

    const confirmButton = screen.getByRole("button", { name: /confirmar acceso/i });
    await user.click(confirmButton);

    expect(
      screen.getByText(/debes seleccionar una causa para poder continuar/i),
    ).toBeInTheDocument();
  });

  it("calls onFetchConversation and displays messages when confirmed with valid reason", async () => {
    const user = userEvent.setup();
    const handleFetch = vi.fn().mockResolvedValue(sampleResult);

    render(
      <AuditedChatDialog
        isOpen={true}
        onClose={vi.fn()}
        operationId="op-101"
        onFetchConversation={handleFetch}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "Reclamo de cliente");
    await user.click(screen.getByRole("button", { name: /confirmar acceso/i }));

    expect(handleFetch).toHaveBeenCalledWith("Reclamo de cliente");
    expect(await screen.findByText("Hola mundo")).toBeInTheDocument();
  });

  it("shows loading state while fetching conversation", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: AuditedConversationResult) => void;
    const pendingPromise = new Promise<AuditedConversationResult>((resolve) => {
      resolvePromise = resolve;
    });

    render(
      <AuditedChatDialog
        isOpen={true}
        onClose={vi.fn()}
        operationId="op-101"
        onFetchConversation={() => pendingPromise}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "Reclamo de cliente");
    await user.click(screen.getByRole("button", { name: /confirmar acceso/i }));

    expect(screen.getByTestId("audited-chat-loading")).toBeInTheDocument();

    resolvePromise!(sampleResult);
    expect(await screen.findByText("Hola mundo")).toBeInTheDocument();
  });

  it("displays empty state when the conversation has no messages", async () => {
    const user = userEvent.setup();
    const handleFetch = vi.fn().mockResolvedValue({ items: [], total: 0 });

    render(
      <AuditedChatDialog
        isOpen={true}
        onClose={vi.fn()}
        operationId="op-101"
        onFetchConversation={handleFetch}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "Reclamo de cliente");
    await user.click(screen.getByRole("button", { name: /confirmar acceso/i }));

    expect(handleFetch).toHaveBeenCalledWith("Reclamo de cliente");
    expect(
      await screen.findByText(/no se registran mensajes en esta contratación/i),
    ).toBeInTheDocument();
  });
});

