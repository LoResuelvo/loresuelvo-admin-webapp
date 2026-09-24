import type { Consumer } from "@/domain/users/consumer";
import type { Provider, VerificationStatus } from "@/domain/users/provider";
import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import type { ConsumerDetail, ConsumerHistoryFilters } from "@/domain/users/consumer-history";

export interface ProviderFilters {
  q?: string;
  category?: string;
  categoryId?: number;
  coverageZoneId?: number;
  verificationStatus?: VerificationStatus;
}

export interface UserRepository {
  getConsumers(token: string, q?: string): Promise<Consumer[]>;
  getProviders(token: string, filters?: ProviderFilters): Promise<Provider[]>;
  getProviderDiagnostic(token: string, id: number | string): Promise<ProviderDiagnostic>;
  getConsumerHistory(
    token: string,
    id: number | string,
    filters?: ConsumerHistoryFilters,
  ): Promise<ConsumerDetail>;
}


