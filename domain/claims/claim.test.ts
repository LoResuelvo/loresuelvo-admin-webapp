import { expect, it } from "vitest";
import { applyClaimResolution, type ClaimDetails } from "./claim";
const claim: ClaimDetails = { id: "c1", createdAt: "2026-01-01", operationId: 1, claimantType: "consumer", claimantName: "Ana", respondentName: "Luis", categoryName: "Servicio", status: "in_review", urgency: "low", claimReason: "Motivo", description: "Descripción", evidencePhotoUrls: [] };
it.each(["favor_consumer", "favor_provider", "mutual_agreement", "dismissed"])("derives status from confirmed %s resolution without mutating the claim", (resolutionType) => {
 const resolution = { resolutionType, reason: "Dictamen confirmado" };
 const updated = applyClaimResolution(claim, resolution);
 expect(updated.status).toBe(resolutionType === "dismissed" ? "dismissed" : "resolved");
 expect(updated.resolution).toBe(resolution);
 expect(claim.status).toBe("in_review");
});
