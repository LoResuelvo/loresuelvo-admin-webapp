"use client";

import { useState } from "react";
import type { Category } from "@/domain/categories/category";
import { CreateCategoryModal } from "@/components/categories/create-category-modal";
import { translations } from "@/infrastructure/i18n/translations";

export type CategoriesPageProps = {
  categories?: Category[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCreateCategory?: (name: string) => Promise<void>;
  createError?: string | null;
};

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CategoriesHeader({ onOpenModal }: { onOpenModal: () => void }) {
  const copy = translations.categories;
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
        {copy.title}
      </h1>
      <button
        type="button"
        onClick={onOpenModal}
        className="inline-flex items-center gap-2 rounded-xl bg-[#147560] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        <PlusIcon />
        <span>{copy.newCategory}</span>
      </button>
    </div>
  );
}

function CategoriesSuccessAlert({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
    >
      {message}
    </div>
  );
}

function CategoriesLoading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-16 text-center">
      <span
        aria-hidden="true"
        className="mb-4 block size-8 rounded-full border-2 border-[#147560]/20 border-t-[#147560] motion-safe:animate-spin"
      />
      <p className="text-sm font-medium text-[#1A2B48]/70">
        {translations.categories.loading}
      </p>
    </div>
  );
}

function CategoriesError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
    >
      <p className="font-medium">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {translations.categories.retry}
        </button>
      )}
    </div>
  );
}

function CategoriesEmpty() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs"
    >
      <p className="text-base font-medium text-[#1A2B48]/80">
        {translations.categories.empty}
      </p>
    </div>
  );
}

function CategoriesTable({ categories }: { categories: readonly Category[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs">
      <table className="w-full text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
          <tr>
            <th scope="col" className="px-6 py-4 w-28">
              {translations.categories.columns.id}
            </th>
            <th scope="col" className="px-6 py-4">
              {translations.categories.columns.name}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {categories.map((category) => (
            <tr key={category.id} className="transition-colors hover:bg-[#F4F1EE]/30">
              <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-[#1A2B48]/60">
                {category.id}
              </td>
              <td className="px-6 py-4 font-medium text-[#1A2B48]">
                {category.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useCategoriesCreation(onCreateCategory?: (name: string) => Promise<void>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = async (name: string) => {
    if (!onCreateCategory) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onCreateCategory(name);
      setIsModalOpen(false);
      setSuccessMessage(translations.categories.createSuccess);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear rubro";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError(null);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    submitError,
    successMessage,
    handleCreate,
    handleCloseModal,
  };
}

export function CategoriesPage({
  categories = [],
  isLoading = false,
  error = null,
  onRetry,
  onCreateCategory,
  createError = null,
}: CategoriesPageProps) {
  const {
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    submitError,
    successMessage,
    handleCreate,
    handleCloseModal,
  } = useCategoriesCreation(onCreateCategory);

  return (
    <section aria-label={translations.categories.title} className="max-w-6xl space-y-6">
      <CategoriesHeader onOpenModal={() => setIsModalOpen(true)} />

      {successMessage && <CategoriesSuccessAlert message={successMessage} />}

      {isLoading && <CategoriesLoading />}

      {!isLoading && error && <CategoriesError error={error} onRetry={onRetry} />}

      {!isLoading && !error && categories.length === 0 && <CategoriesEmpty />}

      {!isLoading && !error && categories.length > 0 && (
        <CategoriesTable categories={categories} />
      )}

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        error={submitError || createError}
      />
    </section>
  );
}
