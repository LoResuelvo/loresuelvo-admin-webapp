import type { Consumer } from "@/domain/users/consumer";

export interface UserRepository {
  getConsumers(token: string, q?: string): Promise<Consumer[]>;
}
