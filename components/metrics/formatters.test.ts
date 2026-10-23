import { describe, expect, it } from "vitest";
import {
  formatDurationMinutes,
  formatEffectivePeriod,
  formatObservationDate,
  formatPercentage,
} from "./formatters";

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
    expect(formatPercentage(null)).toBe("—");
  });
});

describe("formatEffectivePeriod", () => {
  it("shows the exclusive end boundary in the backend timezone", () => {
    const formatted = formatEffectivePeriod(
      "2026-10-15T03:00:00Z",
      "2026-10-23T03:00:00Z",
      "America/Argentina/Buenos_Aires",
      "(hasta exclusivo)",
    );
    expect(formatted).toMatch(
      /15\/10\/2026,?\s00:00:00.*23\/10\/2026,?\s00:00:00 \(hasta exclusivo\)$/,
    );
  });

  it("keeps intraday boundaries exact after timezone conversion", () => {
    const formatted = formatEffectivePeriod(
      "2026-10-23T18:30:00Z",
      "2026-10-23T18:45:37Z",
      "America/Argentina/Buenos_Aires",
      "(hasta exclusivo)",
    );
    expect(formatted).toContain("23/10/2026");
    expect(formatted).toContain("15:30:00");
    expect(formatted).toContain("15:45:37");
    expect(formatted).toContain("(hasta exclusivo)");
  });

  it("keeps date-only legacy boundaries as calendar dates", () => {
    const formatted = formatEffectivePeriod(
      "2026-10-15",
      "2026-10-23",
      "America/Argentina/Buenos_Aires",
      "(hasta exclusivo)",
    );
    expect(formatted).toBe("15/10/2026 – 23/10/2026");
  });

  it("handles null or undefined dates", () => {
    expect(formatEffectivePeriod(null, null)).toBe("-");
  });
});

describe("formatObservationDate", () => {
  it("formats observation date with timezone", () => {
    const formatted = formatObservationDate(
      "2026-10-23T21:00:00Z",
      "America/Argentina/Buenos_Aires",
    );
    expect(formatted).toContain("23/10/2026");
    expect(formatted).toMatch(/23\/10\/2026,?\s18:00/);
    expect(formatted).toContain("America/Argentina/Buenos_Aires");
  });

  it("handles null or undefined observation date", () => {
    expect(formatObservationDate(null)).toBe("");
  });
});
