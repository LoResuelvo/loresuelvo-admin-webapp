export interface ProviderCategory {
  id: number;
  name: string;
}

export interface ProviderCoverageZone {
  id: number;
  name: string;
  isActive: boolean;
}

export interface ProviderIdentityVerification {
  status: string;
  verifiedAt?: string;
}

export interface ProviderPaymentConnection {
  isConnected: boolean;
  accountId?: string;
  canReceivePayments: boolean;
}

export interface ProviderCalendarConnection {
  status: "connected" | "disconnected" | string;
}

export interface ProviderRecentOperation {
  id: number;
  categoryName: string;
  consumerName: string;
  status: string;
  createdAt: string;
}

export interface ProviderActivitySummary {
  totalRequests: number;
  activeOrders: number;
  completedOrders: number;
  averageRating: number;
  reviewsCount: number;
  recentOperations: ProviderRecentOperation[];
}

export interface ProviderDiagnostic {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  profilePhotoUrl?: string;
  category: ProviderCategory;
  coverageZones: ProviderCoverageZone[];
  identityVerification: ProviderIdentityVerification;
  paymentConnection: ProviderPaymentConnection;
  calendarConnection: ProviderCalendarConnection;
  activitySummary?: ProviderActivitySummary;
}
