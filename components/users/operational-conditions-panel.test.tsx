import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationalConditionsPanel } from "./operational-conditions-panel";

describe("OperationalConditionsPanel", () => {
  const defaultProps = {
    identityVerification: {
      status: "approved",
      verifiedAt: "2026-09-15T12:00:00-03:00",
    },
    paymentConnection: {
      isConnected: true,
      accountId: "mp-acc-8812",
      canReceivePayments: true,
    },
    coverageZones: [
      { id: 6, name: "Comuna 6", isActive: true },
      { id: 14, name: "Comuna 14", isActive: false },
    ],
    calendarConnection: {
      status: "connected",
    },
  };

  it("renders all four operational condition cards", () => {
    render(<OperationalConditionsPanel {...defaultProps} />);

    expect(screen.getByTestId("operational-conditions-panel")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /condiciones operativas/i })).toBeInTheDocument();
    expect(screen.getByText("Identidad")).toBeInTheDocument();
    expect(screen.getByText("Cobros")).toBeInTheDocument();
    expect(screen.getByText("Zonas")).toBeInTheDocument();
    expect(screen.getByText("Calendario")).toBeInTheDocument();
  });

  it("displays connected payment status with account id", () => {
    render(<OperationalConditionsPanel {...defaultProps} />);

    expect(screen.getAllByText("Conectado").length).toBeGreaterThan(0);
    expect(screen.getByText("mp-acc-8812")).toBeInTheDocument();
    expect(screen.getByText("Habilitado para recibir cobros")).toBeInTheDocument();
  });

  it("displays disconnected payment status and warning when disconnected", () => {
    render(
      <OperationalConditionsPanel
        {...defaultProps}
        paymentConnection={{
          isConnected: false,
          canReceivePayments: false,
        }}
      />,
    );

    expect(screen.getByText("Desconectado")).toBeInTheDocument();
    const alerts = screen.getAllByText("No puede recibir señas ni pagos");
    expect(alerts.length).toBeGreaterThan(0);
  });

  it("displays active coverage zones count and zone tags", () => {
    render(<OperationalConditionsPanel {...defaultProps} />);

    expect(screen.getByText("1 activa")).toBeInTheDocument();
    expect(screen.getByText("Comuna 6")).toBeInTheDocument();
    expect(screen.getByText("Comuna 14")).toBeInTheDocument();
  });
});
