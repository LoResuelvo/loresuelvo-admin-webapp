"use client";

import { translations } from "@/infrastructure/i18n/translations";
import type { ResolutionType } from "./claim-resolution-modal";

interface ResolutionTypeSelectProps {
  id: string;
  value: ResolutionType;
  onChange: (val: ResolutionType) => void;
  disabled: boolean;
}

export function ResolutionTypeSelect({
  id,
  value,
  onChange,
  disabled,
}: ResolutionTypeSelectProps) {
  const copy = translations.claims.resolution;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2B48]">
        {copy.typeLabel}
      </label>
      <select
        id={id}
        name="resolutionType"
        value={value}
        onChange={(e) => onChange(e.target.value as ResolutionType)}
        disabled={disabled}
        className="mt-1.5 block w-full rounded-xl border border-[#1A2B48]/20 bg-white px-3.5 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-none focus:ring-2 focus:ring-[#147560]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="favor_consumer">{copy.types.favor_consumer}</option>
        <option value="favor_provider">{copy.types.favor_provider}</option>
        <option value="mutual_agreement">{copy.types.mutual_agreement}</option>
        <option value="dismissed">{copy.types.dismissed}</option>
      </select>
    </div>
  );
}

interface ResolutionReasonTextareaProps {
  id: string;
  errorId: string;
  value: string;
  onChange: (val: string) => void;
  error: string | null;
  disabled: boolean;
}

export function ResolutionReasonTextarea({
  id,
  errorId,
  value,
  onChange,
  error,
  disabled,
}: ResolutionReasonTextareaProps) {
  const copy = translations.claims.resolution;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2B48]">
        {copy.reasonLabel}
      </label>
      <textarea
        id={id}
        name="reason"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={copy.reasonPlaceholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 block w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#1A2B48] placeholder-[#1A2B48]/40 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-400/20"
            : "border-[#1A2B48]/20 focus:border-[#147560] focus:ring-[#147560]/20"
        }`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface ResolutionCompensationInputProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

export function ResolutionCompensationInput({
  id,
  value,
  onChange,
  disabled,
}: ResolutionCompensationInputProps) {
  const copy = translations.claims.resolution;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2B48]">
        {copy.compensationLabel}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="0"
        className="mt-1.5 block w-full rounded-xl border border-[#1A2B48]/20 bg-white px-3.5 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-none focus:ring-2 focus:ring-[#147560]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </div>
  );
}
