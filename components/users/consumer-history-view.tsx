import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerProfileHeader, type ConsumerCoverageZone } from "./consumer-profile-header";

export interface ConsumerHistoryViewProps {
  consumer: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    profilePhotoUrl?: string;
    registeredAt: string;
    currentAddress: string;
    coverageZone: ConsumerCoverageZone;
    history?: unknown[];
  };
}

export function ConsumerHistoryView({ consumer }: ConsumerHistoryViewProps) {
  return (
    <div
      role="region"
      aria-label={translations.users.consumerDetail.title}
      className="space-y-6"
    >
      <ConsumerProfileHeader
        name={consumer.name}
        surname={consumer.surname}
        email={consumer.email}
        phone={consumer.phone}
        profilePhotoUrl={consumer.profilePhotoUrl}
        registeredAt={consumer.registeredAt}
        currentAddress={consumer.currentAddress}
        coverageZone={consumer.coverageZone}
      />
    </div>
  );
}
