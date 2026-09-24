import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProviderProfileHeader } from "./provider-profile-header";

describe("ProviderProfileHeader", () => {
  const defaultProps = {
    name: "Juan",
    surname: "Gómez",
    email: "juan@example.com",
    phone: "+54 11 5555-0101",
    profilePhotoUrl: "https://example.com/photo.jpg",
    category: { id: 2, name: "Plomería" },
  };

  it("renders provider full name, email, phone and category", () => {
    render(<ProviderProfileHeader {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1, name: "Juan Gómez" })).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText("+54 11 5555-0101")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
  });

  it("renders profile image when URL is provided", () => {
    render(<ProviderProfileHeader {...defaultProps} />);

    const img = screen.getByRole("img", { name: "Juan Gómez" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", defaultProps.profilePhotoUrl);
  });

  it("renders initials fallback when profile photo is missing", () => {
    render(<ProviderProfileHeader {...defaultProps} profilePhotoUrl={undefined} />);

    expect(screen.getByLabelText("Juan Gómez")).toHaveTextContent("JG");
  });
});
