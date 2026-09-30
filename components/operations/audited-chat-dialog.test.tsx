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

  it("discards a pending private response after closing the dialog", async () => {
    const user = userEvent.setup();
    let resolvePage!: (page: AuditedConversationResult) => void;
    const pending = new Promise<AuditedConversationResult>((resolve) => { resolvePage = resolve; });
    const onClose = vi.fn();
    const { rerender } = render(<AuditedChatDialog isOpen onClose={onClose} operationId="jr-101" onFetchConversation={() => pending} />);
    await user.selectOptions(screen.getByRole("combobox"), "Reclamo de cliente");
    await user.click(screen.getByRole("button", { name: /confirmar acceso/i }));
    await user.click(screen.getByRole("button", { name: "Cerrar modal" }));
    rerender(<AuditedChatDialog isOpen={false} onClose={onClose} operationId="jr-101" onFetchConversation={() => pending} />);
    resolvePage(sampleResult);
    rerender(<AuditedChatDialog isOpen onClose={onClose} operationId="jr-101" onFetchConversation={() => pending} />);
    expect(screen.queryByText("Hola mundo")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("appends the next audited page with the same reason and retains loaded messages after a retry", async () => {
    const user = userEvent.setup();
    const handleFetch = vi.fn()
      .mockResolvedValueOnce({ ...sampleResult, nextCursor: "cursor-2" })
      .mockRejectedValueOnce(new Error("Error al obtener la conversación auditada."))
      .mockResolvedValueOnce({ items: [{ ...sampleResult.items[0], id: 2, content: "Segunda página" }], total: 1, nextCursor: null });
    render(<AuditedChatDialog isOpen onClose={vi.fn()} operationId="jr-101" onFetchConversation={handleFetch} />);
    await user.selectOptions(screen.getByRole("combobox"), "Reclamo de cliente");
    await user.click(screen.getByRole("button", { name: /confirmar acceso/i }));
    expect(await screen.findByText("Hola mundo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cargar más mensajes/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Hola mundo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(await screen.findByText("Segunda página")).toBeInTheDocument();
    expect(handleFetch).toHaveBeenLastCalledWith("Reclamo de cliente", "cursor-2");
    expect(screen.getByText("Hola mundo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cargar más mensajes/i })).not.toBeInTheDocument();
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

  it("displays forbidden alert without retry button when access is restricted", async () => {
    const user = userEvent.setup();
    const error = new Error("El acceso a la conversación está restringido.");
    (error as Error & { isForbidden?: boolean }).isForbidden = true;
    const handleFetch = vi.fn().mockRejectedValue(error);

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

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/el acceso a la conversación está restringido/i);
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it("displays error alert with retry button and retries on click", async () => {
    const user = userEvent.setup();
    const handleFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Error al obtener la conversación auditada."))
      .mockResolvedValueOnce(sampleResult);

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

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/error al obtener la conversación auditada/i);

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(handleFetch).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("Hola mundo")).toBeInTheDocument();
  });
});

