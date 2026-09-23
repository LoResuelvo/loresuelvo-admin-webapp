import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OperationsInboxClient } from "./operations-inbox-client";
import * as actions from "@/app/(dashboard)/operaciones/actions";
import type { OperationSummary } from "@/domain/operations/operation-summary";

vi.mock("@/app/(dashboard)/operaciones/actions", () => ({
  getOperationsAction: vi.fn(),
}));

const mockOperations: OperationSummary[] = [
  {
    id: "op-1",
    jobRequestId: 101,
    serviceProposalId: 201,
    consumer: {
      id: 1,
      name: "Juan",
      surname: "Pérez",
      email: "juan.perez@example.com",
    },
    provider: {
      id: 2,
      name: "Carlos",
      surname: "López",
      email: "carlos.lopez@example.com",
    },
    category: {
      id: 1,
      name: "Plomería",
    },
    status: "in_progress",
    bottleneck: "stalled",
    nextActionBy: "provider",
    createdAt: "2026-09-18T10:00:00Z",
    updatedAt: "2026-09-20T14:30:00Z",
  },
];

describe("OperationsInboxClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders operations table and filter bar when data loads successfully", async () => {
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: mockOperations,
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    expect(screen.getByRole("combobox", { name: "Alerta Operativa" })).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  it("filters operations when bottleneck alert changes", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: mockOperations,
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" });
    await user.selectOptions(select, "stalled");

    expect(actions.getOperationsAction).toHaveBeenCalledWith(
      expect.objectContaining({ bottleneck: "stalled" }),
    );
  });

  it("renders empty state when no operations match", async () => {
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByTestId("operations-empty-state")).toBeInTheDocument();
    });

    expect(screen.getByRole("combobox", { name: "Alerta Operativa" })).toBeInTheDocument();
  });
});
