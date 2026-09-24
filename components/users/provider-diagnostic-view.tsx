import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import { ProviderProfileHeader } from "./provider-profile-header";
import { OperationalConditionsPanel } from "./operational-conditions-panel";
import { ProviderActivitySummary } from "./provider-activity-summary";

export interface ProviderDiagnosticViewProps {
  diagnostic: ProviderDiagnostic;
}

export function ProviderDiagnosticView({ diagnostic }: ProviderDiagnosticViewProps) {
  return (
    <div
      role="region"
      aria-label="Diagnóstico operativo del prestador"
      className="space-y-6"
    >
      <ProviderProfileHeader
        name={diagnostic.name}
        surname={diagnostic.surname}
        email={diagnostic.email}
        phone={diagnostic.phone}
        profilePhotoUrl={diagnostic.profilePhotoUrl}
        category={diagnostic.category}
      />

      <OperationalConditionsPanel
        identityVerification={diagnostic.identityVerification}
        paymentConnection={diagnostic.paymentConnection}
        coverageZones={diagnostic.coverageZones}
        calendarConnection={diagnostic.calendarConnection}
      />

      <ProviderActivitySummary
        activitySummary={diagnostic.activitySummary}
      />
    </div>
  );
}
