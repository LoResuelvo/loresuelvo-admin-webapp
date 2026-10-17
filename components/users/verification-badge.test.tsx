import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VerificationBadge } from "./verification-badge";

describe("VerificationBadge", () => {
  it.each([
    "unverified",
    "not_started",
    "in_progress",
    "awaiting_user",
    "in_review",
    "approved",
    "declined",
    "resubmitted",
    "abandoned",
    "expired",
    "kyc_expired",
  ] as const)("renders the %s status returned by the API", (status) => {
    render(<VerificationBadge status={status} />);

    expect(screen.getByTestId("verification-badge")).toBeInTheDocument();
    expect(screen.getByTestId("verification-badge").querySelector("[aria-hidden='true']")).toHaveClass("size-1.5");
  });

  it("renders approved badge correctly", () => {
    render(<VerificationBadge status="approved" />);
    expect(screen.getByText("Verificado")).toBeInTheDocument();
  });

  it("renders in_review badge correctly", () => {
    render(<VerificationBadge status="in_review" />);
    expect(screen.getByText("En revisión")).toBeInTheDocument();
  });

  it("renders declined badge correctly", () => {
    render(<VerificationBadge status="declined" />);
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
  });

  it("renders unverified badge correctly", () => {
    render(<VerificationBadge status="unverified" />);
    expect(screen.getByText("Sin verificar")).toBeInTheDocument();
  });
});
