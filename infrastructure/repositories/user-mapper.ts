import type { Consumer } from "@/domain/users/consumer";
import {
  apiConsumersListSchema,
  apiConsumerListItemSchema,
} from "@/infrastructure/api/types";

export function mapConsumer(value: unknown): Consumer {
  const parsed = apiConsumerListItemSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid consumer data");
  }
  return {
    id: parsed.data.id,
    name: parsed.data.name,
    surname: parsed.data.surname,
    email: parsed.data.email,
    profilePhotoUrl: parsed.data.profile_photo_url ?? undefined,
    createdOn: parsed.data.created_on,
  };
}

export function mapConsumers(value: unknown): Consumer[] {
  const parsed = apiConsumersListSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid consumers list data");
  }
  return parsed.data.map((item) => ({
    id: item.id,
    name: item.name,
    surname: item.surname,
    email: item.email,
    profilePhotoUrl: item.profile_photo_url ?? undefined,
    createdOn: item.created_on,
  }));
}
