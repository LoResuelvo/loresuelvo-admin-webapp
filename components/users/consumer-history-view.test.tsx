import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConsumerHistoryView } from "./consumer-history-view";

describe("ConsumerHistoryView", () => {
  const consumerMock = {
    id: 301,
    name: "Carlos",
    surname: "López",
    email: "carlos@example.com",
    phone: "+54 11 4444-2222",
    profilePhotoUrl: "https://example.com/photo.jpg",
    registeredAt: "2026-09-01T10:00:00-03:00",
    currentAddress: "Av. Rivadavia 4500",
    coverageZone: { id: 6, name: "Comuna 6" },
    history: [],
  };

  it("renders the consumer history view container with profile header", () => {
    render(<ConsumerHistoryView consumer={consumerMock} />);

    expect(
      screen.getByRole("region", { name: "Ficha del Consumidor" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Carlos López" })).toBeInTheDocument();
    expect(screen.getByTestId("consumer-profile-header")).toBeInTheDocument();
  });
});
