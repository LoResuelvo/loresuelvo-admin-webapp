"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Consumer } from "@/domain/users/consumer";
import type { Provider, VerificationStatus } from "@/domain/users/provider";
import type { ProviderFilters } from "@/ports/users/user-repository";
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
  const requestGeneration = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [state, setState] = useState<TabState<Consumer>>(initialTabState);

  const load = useCallback(async (query?: string) => {
    const generation = ++requestGeneration.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const result = await getConsumersAction(query);
      if (generation !== requestGeneration.current) return;
      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null, isForbidden: false });
      } else {
        setState({ data: [], isLoading: false, error: result.error, isForbidden: result.isForbidden ?? false });
      }
    } catch {
      if (generation !== requestGeneration.current) return;
      setState({ data: [], isLoading: false, error: "Error al cargar consumidores", isForbidden: false });
    }
  }, []);

  useEffect(() => {
    void load(searchQuery);
    return () => { requestGeneration.current += 1; };
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

function buildProviderFilters(
  q?: string,
  cat?: string,
  status?: VerificationStatus | "",
): ProviderFilters | undefined {
  const filters: ProviderFilters = {};
  if (q) filters.q = q;
  if (cat) filters.category = cat;
  if (status) filters.verificationStatus = status;
  return Object.keys(filters).length > 0 ? filters : undefined;
}

function ProvidersTabContent() {
  const requestGeneration = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | "">("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [state, setState] = useState<TabState<Provider>>(initialTabState);

  const load = useCallback(
    async (q?: string, cat?: string, status?: VerificationStatus | "") => {
      const generation = ++requestGeneration.current;
      setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
      try {
        const filters = buildProviderFilters(q, cat, status);
        const result = await getProvidersAction(filters);
        if (generation !== requestGeneration.current) return;
        if (result.success) {
          setState({ data: result.data, isLoading: false, error: null, isForbidden: false });
          if (result.data.length > 0) {
            setAvailableCategories((prev) => {
              const next = new Set(prev);
              for (const p of result.data) {
                if (p.category?.name) next.add(p.category.name);
              }
              return Array.from(next).sort();
            });
          }
        } else {
          setState({ data: [], isLoading: false, error: result.error, isForbidden: result.isForbidden ?? false });
        }
      } catch {
        if (generation !== requestGeneration.current) return;
        setState({ data: [], isLoading: false, error: "Error al cargar prestadores", isForbidden: false });
      }
    },
    [],
  );

  useEffect(() => {
    void load(searchQuery, selectedCategory, selectedStatus);
    return () => { requestGeneration.current += 1; };
  }, [load, searchQuery, selectedCategory, selectedStatus]);

  return (
    <ProvidersView
      providers={state.data}
      isLoading={state.isLoading}
      error={state.error}
      isForbidden={state.isForbidden}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      categories={availableCategories}
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      onRetry={() => load(searchQuery, selectedCategory, selectedStatus)}
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
