import type { ConsumerDetail } from "@/domain/users/consumer-history";
import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerProfileHeader } from "./consumer-profile-header";
import { ConsumerHistoryList } from "./consumer-history-list";

export interface ConsumerHistoryViewProps {
  consumer: ConsumerDetail;
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

      <ConsumerHistoryList history={consumer.history} />
    </div>
  );
}
