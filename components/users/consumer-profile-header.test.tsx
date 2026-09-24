import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConsumerProfileHeader } from "./consumer-profile-header";

describe("ConsumerProfileHeader", () => {
  const defaultProps = {
    name: "Carlos",
    surname: "López",
    email: "carlos@example.com",
    phone: "+54 11 4444-2222",
    profilePhotoUrl: "https://example.com/photo.jpg",
    registeredAt: "2026-09-01T10:00:00-03:00",
    currentAddress: "Av. Rivadavia 4500",
    coverageZone: { id: 6, name: "Comuna 6" },
  };

  it("renders consumer full name, email, phone, registered date, address, and zone", () => {
    render(<ConsumerProfileHeader {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1, name: "Carlos López" })).toBeInTheDocument();
    expect(screen.getByText("carlos@example.com")).toBeInTheDocument();
    expect(screen.getByText("+54 11 4444-2222")).toBeInTheDocument();
    expect(screen.getByText("01/09/2026")).toBeInTheDocument();
    expect(screen.getByText("Av. Rivadavia 4500")).toBeInTheDocument();
    expect(screen.getByText("Comuna 6")).toBeInTheDocument();
  });

  it("renders profile image when URL is provided", () => {
    render(<ConsumerProfileHeader {...defaultProps} />);

    const img = screen.getByRole("img", { name: "Carlos López" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", defaultProps.profilePhotoUrl);
  });

  it("renders initials fallback when profile photo is missing", () => {
    render(<ConsumerProfileHeader {...defaultProps} profilePhotoUrl={undefined} />);

    expect(screen.getByLabelText("Carlos López")).toHaveTextContent("CL");
  });
});
