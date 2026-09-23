import type { Provider } from "@/domain/users/provider";
import type { ProviderFilters, UserRepository } from "@/ports/users/user-repository";

export async function getProviders(
  userRepository: UserRepository,
  token: string,
  filters?: ProviderFilters,
): Promise<Provider[]> {
  return userRepository.getProviders(token, filters);
}
