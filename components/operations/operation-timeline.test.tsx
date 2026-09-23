import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationTimeline } from "./operation-timeline";

describe("OperationTimeline", () => {
  const sampleMilestones = [
    {
      type: "job_requested",
      title: "Solicitud creada",
      timestamp: "2026-09-18T10:00:00Z",
    },
    {
      type: "proposal_sent",
      title: "Presupuesto enviado",
      timestamp: "2026-09-19T11:30:00Z",
    },
    {
      type: "order_created",
      title: "Orden de trabajo confirmada",
      timestamp: "2026-09-20T14:00:00Z",
    },
  ];

  it("renders container with data-testid operation-timeline", () => {
    render(<OperationTimeline milestones={sampleMilestones} />);
    expect(screen.getByTestId("operation-timeline")).toBeInTheDocument();
  });

  it("renders all milestones with their titles and formatted dates", () => {
    render(<OperationTimeline milestones={sampleMilestones} />);
    const milestones = screen.getAllByTestId("timeline-milestone");
    expect(milestones).toHaveLength(3);

    expect(screen.getByText("Solicitud creada")).toBeInTheDocument();
    expect(screen.getByText("Presupuesto enviado")).toBeInTheDocument();
    expect(screen.getByText("Orden de trabajo confirmada")).toBeInTheDocument();
  });

  it("renders progress step indicators for each milestone", () => {
    render(<OperationTimeline milestones={sampleMilestones} />);
    const steps = screen.getAllByTestId("milestone-step");
    expect(steps).toHaveLength(3);
  });

  it("renders empty message when no milestones exist", () => {
    render(<OperationTimeline milestones={[]} />);
    expect(screen.getByText(/no hay eventos registrados/i)).toBeInTheDocument();
  });
});
