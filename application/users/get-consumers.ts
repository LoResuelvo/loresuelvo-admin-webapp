import type { Consumer } from "@/domain/users/consumer";
import type { UserRepository } from "@/ports/users/user-repository";

export async function getConsumers(
  userRepository: UserRepository,
  token: string,
  q?: string,
): Promise<Consumer[]> {
  return userRepository.getConsumers(token, q);
}
