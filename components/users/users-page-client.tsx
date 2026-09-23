"use client";

import { useCallback, useEffect, useState } from "react";
import type { Consumer } from "@/domain/users/consumer";
import { UsersTabs, type UsersTab } from "./users-tabs";
import { ConsumersView } from "./consumers-view";
import { getConsumersAction } from "@/app/(dashboard)/usuarios/actions";

interface ConsumersState {
  data: Consumer[];
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
}

const initialConsumersState: ConsumersState = {
  data: [],
  isLoading: true,
  error: null,
  isForbidden: false,
};

export function UsersPageClient() {
  const [activeTab, setActiveTab] = useState<UsersTab>("consumers");
  const [searchQuery, setSearchQuery] = useState("");
  const [state, setState] = useState<ConsumersState>(initialConsumersState);

  const loadConsumers = useCallback(async (query?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const result = await getConsumersAction(query);
      if (result.success) {
        setState({
          data: result.data,
          isLoading: false,
          error: null,
          isForbidden: false,
        });
      } else {
        setState({
          data: [],
          isLoading: false,
          error: result.error,
          isForbidden: result.isForbidden ?? false,
        });
      }
    } catch {
      setState({
        data: [],
        isLoading: false,
        error: "Error al cargar consumidores",
        isForbidden: false,
      });
    }
  }, []);

  useEffect(() => {
    loadConsumers(searchQuery);
  }, [loadConsumers, searchQuery]);

  return (
    <div className="space-y-6">
      <UsersTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "consumers" && (
        <ConsumersView
          consumers={state.data}
          isLoading={state.isLoading}
          error={state.error}
          isForbidden={state.isForbidden}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRetry={() => loadConsumers(searchQuery)}
        />
      )}
      {activeTab === "providers" && (
        <div id="panel-providers" role="tabpanel" aria-labelledby="tab-providers">
          {/* Will be implemented in Batch 2 */}
        </div>
      )}
    </div>
  );
}
