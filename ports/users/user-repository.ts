import type { Consumer } from "@/domain/users/consumer";
import type { Provider, VerificationStatus } from "@/domain/users/provider";

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
}
