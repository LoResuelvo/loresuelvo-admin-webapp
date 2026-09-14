"use client";

import { useEffect, useState } from "react";
import type { AdminAccess } from "@/domain/auth/admin-access";
import { queryAdminAccess } from "@/infrastructure/auth/query-admin-access";

type AccessState = AdminAccess | { status: "pending" };

export function useAdminAccess(): AccessState {
  const [state, setState] = useState<AccessState>({ status: "pending" });
  useEffect(() => {
    const request = new AbortController();
    queryAdminAccess(request.signal).then(
      result => { if (!request.signal.aborted) setState(result); },
      () => { if (!request.signal.aborted) setState({ status: "unavailable" }); },
    );
    return () => request.abort();
  }, []);
  return state;
}
