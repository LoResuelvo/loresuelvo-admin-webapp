import { describe, expect, it } from "vitest";
import { calculateConversionRate } from "./funnel";

describe("calculateConversionRate", () => {
  it("returns a rate for a positive denominator, including zero progress", () => {
    expect(calculateConversionRate(2, 4)).toBe(0.5);
    expect(calculateConversionRate(0, 4)).toBe(0);
  });

  it("keeps the rate unavailable when the denominator is zero", () => {
    expect(calculateConversionRate(0, 0)).toBeNull();
  });
});
