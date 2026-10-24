import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentsPageClient } from "./payments-page-client";
import * as actions from "@/app/(dashboard)/pagos/actions";
import { multiplePaymentFixtures, paymentListFixture } from "./payment-test-fixtures";

vi.mock("@/app/(dashboard)/pagos/actions");

describe("PaymentsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and renders payments on mount with the API page size", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: true,
      data: paymentListFixture(),
    });

    render(<PaymentsPageClient />);
    expect(screen.getByTestId("payments-skeleton")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("0f8fad5b-d9cb-469f-a165-70867728950e")).toBeInTheDocument();
      expect(actions.getPaymentsAction).toHaveBeenLastCalledWith({ limit: 20 });
    });
    expect(screen.getByRole("combobox", { name: "Buscar por" })).toHaveValue("consumerEmail");
  });

  it("sends purpose and intent status filters to the API", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: true,
      data: paymentListFixture(multiplePaymentFixtures),
    });

    const user = userEvent.setup();
    render(<PaymentsPageClient />);
    await screen.findByText("0f8fad5b-d9cb-469f-a165-70867728950e");

    await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por propósito" }), "booking_deposit");
    await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por estado" }), "paid");

    await waitFor(() => {
      expect(actions.getPaymentsAction).toHaveBeenLastCalledWith({
        limit: 20,
        purpose: "booking_deposit",
        intentStatus: "paid",
      });
    });
  });

  it("submits a supported payment query parameter", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: true,
      data: paymentListFixture(),
    });

    const user = userEvent.setup();
    render(<PaymentsPageClient />);
    await screen.findByText("0f8fad5b-d9cb-469f-a165-70867728950e");
    await user.selectOptions(screen.getByRole("combobox", { name: "Buscar por" }), "externalPaymentId");
    await user.type(screen.getByRole("searchbox", { name: "Buscar pagos" }), "pay_1001");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      expect(actions.getPaymentsAction).toHaveBeenLastCalledWith({
        limit: 20,
        externalPaymentId: "pay_1001",
      });
    });
  });

  it("rejects malformed intent IDs before sending a request", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: true,
      data: paymentListFixture(),
    });

    const user = userEvent.setup();
    render(<PaymentsPageClient />);
    await screen.findByText("0f8fad5b-d9cb-469f-a165-70867728950e");
    await user.selectOptions(screen.getByRole("combobox", { name: "Buscar por" }), "paymentIntentId");
    await user.type(screen.getByRole("searchbox", { name: "Buscar pagos" }), "not-a-uuid");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresá un ID de pago válido.");
    expect(actions.getPaymentsAction).toHaveBeenCalledTimes(1);
  });

  it("loads the next cursor page without repeating existing payment IDs", async () => {
    vi.mocked(actions.getPaymentsAction)
      .mockResolvedValueOnce({ success: true, data: paymentListFixture([multiplePaymentFixtures[0]], "next-page") })
      .mockResolvedValueOnce({ success: true, data: paymentListFixture([multiplePaymentFixtures[1]]) });

    const user = userEvent.setup();
    render(<PaymentsPageClient />);
    await screen.findByText("0f8fad5b-d9cb-469f-a165-70867728950e");
    await user.click(screen.getByRole("button", { name: "Cargar más pagos" }));

    await waitFor(() => {
      expect(screen.getByText("d9428888-122b-11e1-b85c-61cd3cbb3210")).toBeInTheDocument();
      expect(actions.getPaymentsAction).toHaveBeenLastCalledWith({ limit: 20, cursor: "next-page" });
    });
    expect(screen.getAllByText("0f8fad5b-d9cb-469f-a165-70867728950e")).toHaveLength(1);
  });

  it("handles error state and allows retry", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({ success: false, error: "Error de red" });
    render(<PaymentsPageClient />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Error de red"));
  });

  it("handles forbidden state without exposing a retry action", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: false,
      error: "No posees permisos para consultar información financiera. El acceso está restringido.",
      isForbidden: true,
    });

    render(<PaymentsPageClient />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/restringido|permisos/i);
      expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
    });
  });
});
