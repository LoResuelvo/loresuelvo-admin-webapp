import type { ConsumerDetail, ConsumerHistoryFilters } from "@/domain/users/consumer-history";
import type { UserRepository } from "@/ports/users/user-repository";

export class GetConsumerHistoryUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    token: string,
    id: number | string,
    filters?: ConsumerHistoryFilters,
  ): Promise<ConsumerDetail> {
    return this.userRepository.getConsumerHistory(token, id, filters);
  }
}

export async function getConsumerHistory(
  userRepository: UserRepository,
  token: string,
  id: number | string,
  filters?: ConsumerHistoryFilters,
): Promise<ConsumerDetail> {
  return userRepository.getConsumerHistory(token, id, filters);
}
