import type { Consumer } from "@/domain/users/consumer";
import type { Provider } from "@/domain/users/provider";
import {
  apiConsumersListSchema,
  apiConsumerListItemSchema,
  apiProvidersListSchema,
  apiProviderListItemSchema,
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

export function mapProvider(value: unknown): Provider {
  const parsed = apiProviderListItemSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid provider data");
  }
  return {
    id: parsed.data.id,
    name: parsed.data.name,
    surname: parsed.data.surname,
    email: parsed.data.email,
    profilePhotoUrl: parsed.data.profile_photo_url ?? undefined,
    createdOn: parsed.data.created_on,
    category: {
      id: parsed.data.category.id,
      name: parsed.data.category.name,
    },
    coverageZones: parsed.data.coverage_zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      code: zone.code,
    })),
    identityVerificationStatus: parsed.data.identity_verification_status,
    identityVerifiedOn: parsed.data.identity_verified_on ?? undefined,
  };
}

export function mapProviders(value: unknown): Provider[] {
  const parsed = apiProvidersListSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid providers list data");
  }
  return parsed.data.map((item) => ({
    id: item.id,
    name: item.name,
    surname: item.surname,
    email: item.email,
    profilePhotoUrl: item.profile_photo_url ?? undefined,
    createdOn: item.created_on,
    category: {
      id: item.category.id,
      name: item.category.name,
    },
    coverageZones: item.coverage_zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      code: zone.code,
    })),
    identityVerificationStatus: item.identity_verification_status,
    identityVerifiedOn: item.identity_verified_on ?? undefined,
  }));
}

