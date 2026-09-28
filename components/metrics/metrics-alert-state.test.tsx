import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MetricsAlertState } from "./metrics-alert-state";
import { translations } from "@/infrastructure/i18n/translations";

describe("MetricsAlertState", () => {
  it("renders forbidden message when isForbidden is true without retry button", () => {
    render(<MetricsAlertState isForbidden={true} error={null} />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(translations.metrics.forbidden);
    expect(screen.queryByRole("button", { name: translations.metrics.retry })).toBeNull();
  });

  it("renders error message and retry button when error is present", () => {
    const handleRetry = vi.fn();
    render(
      <MetricsAlertState
        isForbidden={false}
        error={translations.metrics.error}
        onRetry={handleRetry}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(translations.metrics.error);

    const retryBtn = screen.getByRole("button", { name: translations.metrics.retry });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("returns null when neither forbidden nor error", () => {
    const { container } = render(
      <MetricsAlertState isForbidden={false} error={null} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
