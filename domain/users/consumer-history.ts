export interface ConsumerCoverageZone {
  id: number;
  name: string;
}

export interface ConsumerHistoryProvider {
  id: number;
  name: string;
  profilePhotoUrl?: string;
}

export interface ConsumerHistoryItem {
  resourceId: number;
  operationId: number;
  resourceType: string;
  categoryName: string;
  provider: ConsumerHistoryProvider;
  status: string;
  totalAmountCents: number;
  createdAt: string;
}

export interface ConsumerHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ConsumerHistoryFilters {
  resourceType?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ConsumerDetail {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  profilePhotoUrl?: string;
  registeredAt: string;
  currentAddress: string;
  coverageZone: ConsumerCoverageZone;
  history: ConsumerHistoryItem[];
  pagination: ConsumerHistoryPagination;
}
