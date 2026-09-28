import { describe, expect, it } from "vitest";
import { formatDurationMinutes, formatPercentage } from "./formatters";

describe("formatDurationMinutes", () => {
  it("formats null or undefined as dash", () => {
    expect(formatDurationMinutes(null)).toBe("-");
    expect(formatDurationMinutes(undefined)).toBe("-");
  });

  it("formats minutes below 60", () => {
    expect(formatDurationMinutes(15)).toBe("15 min");
    expect(formatDurationMinutes(45)).toBe("45 min");
  });

  it("formats exact hours", () => {
    expect(formatDurationMinutes(60)).toBe("1 h");
    expect(formatDurationMinutes(240)).toBe("4 h");
    expect(formatDurationMinutes(360)).toBe("6 h");
  });

  it("formats hours and minutes", () => {
    expect(formatDurationMinutes(90)).toBe("1 h 30 min");
    expect(formatDurationMinutes(125)).toBe("2 h 5 min");
  });

  it("formats exact days", () => {
    expect(formatDurationMinutes(1440)).toBe("1 d");
    expect(formatDurationMinutes(2880)).toBe("2 d");
  });

  it("formats days and hours", () => {
    expect(formatDurationMinutes(1500)).toBe("1 d 1 h");
  });
});

describe("formatPercentage", () => {
  it("formats decimals as integer percentages", () => {
    expect(formatPercentage(0.32)).toBe("32%");
    expect(formatPercentage(0.77)).toBe("77%");
    expect(formatPercentage(1.0)).toBe("100%");
    expect(formatPercentage(0)).toBe("0%");
  });
});
