import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuditedMessagesList } from "./audited-messages-list";
import type { AuditedMessage } from "@/domain/operations/audited-message";

describe("AuditedMessagesList", () => {
  const sampleMessages: AuditedMessage[] = [
    {
      id: 1,
      senderId: 10,
      senderRole: "consumer",
      content: "Hola, necesito coordinar la visita.",
      sentAt: "2026-09-18T10:15:00Z",
      attachments: [],
    },
    {
      id: 2,
      senderId: 20,
      senderRole: "provider",
      content: "Buenas tardes, paso mañana temprano.",
      sentAt: "2026-09-18T10:20:00Z",
      attachments: [
        {
          id: 101,
          fileName: "presupuesto.pdf",
          url: "https://example.com/presupuesto.pdf",
        },
      ],
    },
  ];

  it("renders messages chronologically distinguishing consumer and provider", () => {
    render(
      <AuditedMessagesList
        messages={sampleMessages}
        consumerName="Ana Martínez"
        providerName="Carlos López"
      />,
    );

    const consumerMessage = screen.getByTestId("audited-message-consumer");
    expect(consumerMessage).toHaveTextContent("Ana Martínez");
    expect(consumerMessage).toHaveTextContent("Hola, necesito coordinar la visita.");

    const providerMessage = screen.getByTestId("audited-message-provider");
    expect(providerMessage).toHaveTextContent("Carlos López");
    expect(providerMessage).toHaveTextContent("Buenas tardes, paso mañana temprano.");

    expect(screen.getByText("presupuesto.pdf")).toBeInTheDocument();
  });

  it("renders empty state when no messages are provided", () => {
    render(<AuditedMessagesList messages={[]} />);

    expect(
      screen.getByText(/no se registran mensajes en esta contratación/i),
    ).toBeInTheDocument();
  });
});
