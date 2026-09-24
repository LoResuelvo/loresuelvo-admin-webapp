import { ProviderProfileHeader } from "./provider-profile-header";
import { OperationalConditionsPanel } from "./operational-conditions-panel";

export interface ProviderDiagnosticViewProps {
  diagnostic: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    profilePhotoUrl?: string;
    category: {
      id: number;
      name: string;
    };
    coverageZones: Array<{
      id: number;
      name: string;
      isActive: boolean;
    }>;
    identityVerification: {
      status: string;
      verifiedAt?: string;
    };
    paymentConnection: {
      isConnected: boolean;
      accountId?: string;
      canReceivePayments: boolean;
    };
    calendarConnection: {
      status: string;
    };
  };
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
    </div>
  );
}
