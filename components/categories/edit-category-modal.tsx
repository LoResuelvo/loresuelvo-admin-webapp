"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Category } from "@/domain/categories/category";
import { Modal } from "@/components/ui/modal";
import { translations } from "@/infrastructure/i18n/translations";

export interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (id: number, name: string) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 motion-safe:animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface EditCategoryModalFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
}

function EditCategoryModalFooter({
  isSubmitting,
  onCancel,
  cancelLabel,
  submitLabel,
  submittingLabel,
}: EditCategoryModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="rounded-xl px-4 py-2 text-sm font-medium text-[#1A2B48]/70 transition-colors hover:bg-[#F4F1EE] hover:text-[#1A2B48] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {isSubmitting && <SpinnerIcon />}
        <span>{isSubmitting ? submittingLabel : submitLabel}</span>
      </button>
    </div>
  );
}

interface EditCategoryFieldProps {
  id: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
  placeholder: string;
  error?: string | null;
  errorId: string;
}

function EditCategoryField({
  id,
  inputRef,
  value,
  onChange,
  disabled,
  label,
  placeholder,
  error,
  errorId,
}: EditCategoryFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2B48]">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        name="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={100}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 block w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#1A2B48] placeholder-[#1A2B48]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-400"
            : "border-[#1A2B48]/20 focus:border-[#147560] focus:ring-[#147560]"
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

function useEditCategoryForm(
  category: Category | null,
  isOpen: boolean,
  onClose: () => void,
  onSubmit: (id: number, name: string) => Promise<void> | void,
  isSubmitting: boolean,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = translations.categories.editModal;
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setValidationError(null);
    }
  }, [category, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    setValidationError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError(copy.errors.nameRequired);
      inputRef.current?.focus();
      return;
    }

    setValidationError(null);
    await onSubmit(category.id, trimmed);
  };

  return {
    name,
    setName,
    inputRef,
    validationError,
    setValidationError,
    handleClose,
    handleSubmit,
  };
}

export function EditCategoryModal({
  isOpen,
  category,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}: EditCategoryModalProps) {
  const nameInputId = useId();
  const errorId = useId();
  const copy = translations.categories.editModal;
  const {
    name,
    setName,
    inputRef,
    validationError,
    setValidationError,
    handleClose,
    handleSubmit,
  } = useEditCategoryForm(category, isOpen, onClose, onSubmit, isSubmitting);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={copy.title}
      closeAriaLabel={copy.closeAriaLabel}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <EditCategoryField
          id={nameInputId}
          inputRef={inputRef}
          value={name}
          onChange={(val) => {
            setName(val);
            if (validationError) setValidationError(null);
          }}
          disabled={isSubmitting}
          label={copy.nameLabel}
          placeholder={copy.namePlaceholder}
          error={validationError || error}
          errorId={errorId}
        />

        <EditCategoryModalFooter
          isSubmitting={isSubmitting}
          onCancel={handleClose}
          cancelLabel={copy.cancelButton}
          submitLabel={copy.submitButton}
          submittingLabel={copy.submittingButton}
        />
      </form>
    </Modal>
  );
}
