"use client";

import { useCallback, useEffect, useState } from "react";
import type { Consumer } from "@/domain/users/consumer";
import type { Provider } from "@/domain/users/provider";
import { UsersTabs, type UsersTab } from "./users-tabs";
import { ConsumersView } from "./consumers-view";
import { ProvidersView } from "./providers-view";
import {
  getConsumersAction,
  getProvidersAction,
} from "@/app/(dashboard)/usuarios/actions";

interface TabState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
}

const initialTabState = {
  data: [],
  isLoading: true,
  error: null,
  isForbidden: false,
};

function ConsumersTabContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [state, setState] = useState<TabState<Consumer>>(initialTabState);

  const load = useCallback(async (query?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const result = await getConsumersAction(query);
      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null, isForbidden: false });
      } else {
        setState({ data: [], isLoading: false, error: result.error, isForbidden: result.isForbidden ?? false });
      }
    } catch {
      setState({ data: [], isLoading: false, error: "Error al cargar consumidores", isForbidden: false });
    }
  }, []);

  useEffect(() => {
    load(searchQuery);
  }, [load, searchQuery]);

  return (
    <ConsumersView
      consumers={state.data}
      isLoading={state.isLoading}
      error={state.error}
      isForbidden={state.isForbidden}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onRetry={() => load(searchQuery)}
    />
  );
}

function ProvidersTabContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [state, setState] = useState<TabState<Provider>>(initialTabState);

  const load = useCallback(async (query?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const result = await getProvidersAction(query ? { q: query } : undefined);
      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null, isForbidden: false });
      } else {
        setState({ data: [], isLoading: false, error: result.error, isForbidden: result.isForbidden ?? false });
      }
    } catch {
      setState({ data: [], isLoading: false, error: "Error al cargar prestadores", isForbidden: false });
    }
  }, []);

  useEffect(() => {
    load(searchQuery);
  }, [load, searchQuery]);

  return (
    <ProvidersView
      providers={state.data}
      isLoading={state.isLoading}
      error={state.error}
      isForbidden={state.isForbidden}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onRetry={() => load(searchQuery)}
    />
  );
}

export function UsersPageClient() {
  const [activeTab, setActiveTab] = useState<UsersTab>("consumers");

  return (
    <div className="space-y-6">
      <UsersTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "consumers" && <ConsumersTabContent />}
      {activeTab === "providers" && <ProvidersTabContent />}
    </div>
  );
}
