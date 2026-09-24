"use client";

import { useId } from "react";
import { translations } from "@/infrastructure/i18n/translations";

export const AUDIT_REASONS = [
  translations.operations.chat.reasons.clientClaim,
  translations.operations.chat.reasons.paymentDispute,
  translations.operations.chat.reasons.serviceDelay,
  translations.operations.chat.reasons.supportInvestigation,
] as const;

export interface AuditReasonSelectorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string | null;
  readonly disabled?: boolean;
}

export function AuditReasonSelector({
  value,
  onChange,
  error,
  disabled = false,
}: AuditReasonSelectorProps) {
  const generatedId = useId();
  const selectId = `audit-reason-select-${generatedId}`;
  const errorId = `audit-reason-error-${generatedId}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={selectId}
        className="block text-sm font-semibold text-[#1A2B48]"
      >
        {translations.operations.chat.reasonLabel}
      </label>
      <select
        id={selectId}
        data-testid="audit-reason-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border px-3 py-2 text-sm text-[#1A2B48] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#147560] ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-[#1A2B48]/20 focus:border-[#147560]"
        }`}
      >
        <option value="">{translations.operations.chat.reasonPlaceholder}</option>
        {AUDIT_REASONS.map((reason) => (
          <option key={reason} value={reason}>
            {reason}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={errorId}
          role="alert"
          data-testid="audit-reason-error"
          className="text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
