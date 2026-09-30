import { isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MetricsViewProps } from "./metrics-view";
import { getCategoriesAction } from "@/app/(dashboard)/rubros/actions";
import { getFunnelAction } from "@/app/(dashboard)/metricas/actions";
import MetricasPage from "@/app/(dashboard)/metricas/page";

vi.mock("@/app/(dashboard)/rubros/actions", () => ({
  getCategoriesAction: vi.fn(),
}));

vi.mock("@/app/(dashboard)/metricas/actions", () => ({
  getFunnelAction: vi.fn(),
}));

describe("MetricasPage", () => {
  beforeEach(() => {
    vi.mocked(getFunnelAction).mockReset();
    vi.mocked(getCategoriesAction).mockReset();
  });

  it("loads the current default range and real category catalog", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-02T02:30:00Z"));
    vi.mocked(getFunnelAction).mockResolvedValue({
      success: true,
      data: {
        from: "2026-09-24",
        to: "2026-10-01",
        globalConversionRate: 0.32,
        steps: [],
      },
    });
    vi.mocked(getCategoriesAction).mockResolvedValue({
      success: true,
      data: [
        { id: 47, name: "Climatización" },
        { id: 83, name: "Energía solar" },
      ],
    });

    try {
      const page = await MetricasPage();
      const view = page.props.children;

      expect(getFunnelAction).toHaveBeenCalledWith({
        from: "2026-09-24",
        to: "2026-10-01",
      });
      expect(getCategoriesAction).toHaveBeenCalledTimes(1);
      expect(isValidElement<MetricsViewProps>(view)).toBe(true);
      if (!isValidElement<MetricsViewProps>(view)) {
        throw new Error("Expected the metrics view as the page content");
      }
      expect(view.props).toMatchObject({
        initialFromDate: "2026-09-24",
        initialToDate: "2026-10-01",
        categoryOptions: [
          { id: 47, name: "Climatización" },
          { id: 83, name: "Energía solar" },
        ],
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
