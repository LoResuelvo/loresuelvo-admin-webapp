export type CategoryImpact = Readonly<{
  categoryId: number;
  categoryName: string;
  observedAt: string;
  counts: Readonly<{
    assignedProviders: number;
    pendingRequests: number;
    acceptedRequestsWithoutProposal: number;
    pendingProposals: number;
    scheduledOrders: number;
    awaitingPaymentOrders: number;
  }>;
  hasOngoingOrders: boolean;
  requiresConfirmation: boolean;
  existingOperationsCanContinue: boolean;
  /** Convenience values for the impact summary. */
  providerCount: number;
  activeOrdersCount: number;
}>;
