import type { ConsumerDetail } from "@/domain/users/consumer-history";
import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerProfileHeader } from "./consumer-profile-header";
import { ConsumerHistoryList } from "./consumer-history-list";

export interface ConsumerHistoryViewProps {
  consumer: ConsumerDetail;
  selectedType?: string;
  selectedStatus?: string;
  isHistoryLoading?: boolean;
  isLoadingMore?: boolean;
  isLoadMoreError?: boolean;
  historyError?: string | null;
  onTypeChange?: (type: string) => void;
  onStatusChange?: (status: string) => void;
  onLoadMore?: () => void;
  onRetryHistory?: () => void;
}

export function ConsumerHistoryView({
  consumer,
  selectedType,
  selectedStatus,
  isHistoryLoading,
  isLoadingMore,
  isLoadMoreError,
  historyError,
  onTypeChange,
  onStatusChange,
  onLoadMore,
  onRetryHistory,
}: ConsumerHistoryViewProps) {
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

      <ConsumerHistoryList
        history={consumer.history}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        pagination={consumer.pagination}
        isLoading={isHistoryLoading}
        isLoadingMore={isLoadingMore}
        preserveHistoryOnError={isLoadMoreError}
        error={historyError}
        onTypeChange={onTypeChange}
        onStatusChange={onStatusChange}
        onLoadMore={onLoadMore}
        onRetry={onRetryHistory}
      />
    </div>
  );
}
