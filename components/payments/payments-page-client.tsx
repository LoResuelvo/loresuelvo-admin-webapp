"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaymentIntentSummary } from "./types";
import { PaymentsView } from "./payments-view";
import { getPaymentsAction } from "@/app/(dashboard)/pagos/actions";

interface PaymentsState {
  items: PaymentIntentSummary[];
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
}

const initialState: PaymentsState = {
  items: [],
  isLoading: true,
  error: null,
  isForbidden: false,
};

export function PaymentsPageClient() {
  const [state, setState] = useState<PaymentsState>(initialState);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const result = await getPaymentsAction();
      if (result.success) {
        setState({
          items: result.data.items,
          isLoading: false,
          error: null,
          isForbidden: false,
        });
      } else {
        setState({
          items: [],
          isLoading: false,
          error: result.error,
          isForbidden: result.isForbidden ?? false,
        });
      }
    } catch {
      setState({
        items: [],
        isLoading: false,
        error: "Error al cargar pagos",
        isForbidden: false,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PaymentsView
      items={state.items}
      isLoading={state.isLoading}
      error={state.error}
      onRetry={load}
    />
  );
}
