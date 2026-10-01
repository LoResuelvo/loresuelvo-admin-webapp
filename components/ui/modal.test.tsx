import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal";

describe("Modal", () => {
  it("focuses, traps keyboard navigation, hides outside content, and restores focus", async () => {
    const user = userEvent.setup();
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const view = render(<Modal isOpen onClose={vi.fn()} title="Focus"><button>Last action</button></Modal>);
    const close = screen.getByRole("button", { name: "Cerrar modal" });
    expect(close).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-hidden", "true");
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Last action" })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    view.rerender(<Modal isOpen={false} onClose={vi.fn()} title="Focus"><button>Last action</button></Modal>);
    await vi.waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).not.toHaveAttribute("aria-hidden");
    trigger.remove();
  });

  it("keeps focus and isolation when a controlled caller refuses dismissal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Pending"><button>Last action</button></Modal>);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: "Pending" })).toBeVisible();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Last action" })).toHaveFocus();
    expect(document.body).toHaveAttribute("data-scroll-locked", "1");
  });

  it("renders nothing when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("renders accessible dialog when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Test Modal" })).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("calls onClose when clicking close button", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    const closeButton = screen.getByRole("button", { name: "Cerrar modal" });
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking backdrop", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    await userEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when pressing Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks and restores body scroll overflow", () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    expect(document.body).toHaveAttribute("data-scroll-locked", "1");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });
});
