import { describe, expect, it } from "vitest";
import { formatMoneyArs } from "./money";

describe("formatMoneyArs", () => {
  it("formats positive amounts with ARS currency and two decimals", () => {
    expect(formatMoneyArs(2000000)).toBe("$ 20.000,00");
    expect(formatMoneyArs(1700000)).toBe("$ 17.000,00");
    expect(formatMoneyArs(300000)).toBe("$ 3.000,00");
    expect(formatMoneyArs(5000000)).toBe("$ 50.000,00");
    expect(formatMoneyArs(4250000)).toBe("$ 42.500,00");
  });

  it("formats zero cents correctly", () => {
    expect(formatMoneyArs(0)).toBe("$ 0,00");
  });

  it("formats small amounts with cents correctly", () => {
    expect(formatMoneyArs(150)).toBe("$ 1,50");
  });
});
