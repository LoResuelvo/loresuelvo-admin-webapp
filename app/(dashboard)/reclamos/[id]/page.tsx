import { ClaimDetailClient } from "@/components/claims/claim-detail-client";

export interface ClaimDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-7xl space-y-6">
      <ClaimDetailClient id={id} />
    </div>
  );
}
