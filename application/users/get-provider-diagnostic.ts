import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import type { UserRepository } from "@/ports/users/user-repository";

export class GetProviderDiagnosticUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(token: string, id: number | string): Promise<ProviderDiagnostic> {
    return this.userRepository.getProviderDiagnostic(token, id);
  }
}

export async function getProviderDiagnostic(
  userRepository: UserRepository,
  token: string,
  id: number | string,
): Promise<ProviderDiagnostic> {
  return userRepository.getProviderDiagnostic(token, id);
}
