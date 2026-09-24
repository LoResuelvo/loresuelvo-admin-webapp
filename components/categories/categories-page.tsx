"use client";

import { useState } from "react";
import type { Category } from "@/domain/categories/category";
import type { CategoryImpact } from "@/domain/categories/category-impact";
import { CreateCategoryModal } from "@/components/categories/create-category-modal";
import { EditCategoryModal } from "@/components/categories/edit-category-modal";
import { DeactivateCategoryModal } from "@/components/categories/deactivate-category-modal";
import { CategoriesTable } from "@/components/categories/categories-table";
import {
  CategoriesEmpty,
  CategoriesError,
  CategoriesLoading,
  CategoriesSuccessAlert,
} from "@/components/categories/categories-feedback";
import {
  useCategoriesCreation,
  useCategoriesDeactivation,
  useCategoriesEdit,
} from "./use-categories-actions";
import { translations } from "@/infrastructure/i18n/translations";

export type CategoriesPageProps = {
  categories?: Category[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCreateCategory?: (name: string) => Promise<void>;
  createError?: string | null;
  onUpdateCategory?: (id: number, name: string) => Promise<void>;
  updateError?: string | null;
  onGetImpact?: (id: number) => Promise<CategoryImpact>;
  onDeactivateCategory?: (id: number) => Promise<void>;
  deactivateError?: string | null;
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

interface CategoriesModalsProps {
  creation: ReturnType<typeof useCategoriesCreation>;
  edit: ReturnType<typeof useCategoriesEdit>;
  deactivation: ReturnType<typeof useCategoriesDeactivation>;
  createError: string | null;
  updateError: string | null;
  deactivateError: string | null;
}

function CategoriesModals({
  creation,
  edit,
  deactivation,
  createError,
  updateError,
  deactivateError,
}: CategoriesModalsProps) {
  return (
    <>
      <CreateCategoryModal
        isOpen={creation.isModalOpen}
        onClose={creation.handleCloseModal}
        onSubmit={creation.handleCreate}
        isSubmitting={creation.isSubmitting}
        error={creation.submitError || createError}
      />
      <EditCategoryModal
        isOpen={Boolean(edit.editingCategory)}
        category={edit.editingCategory}
        onClose={edit.handleCloseEdit}
        onSubmit={edit.handleUpdate}
        isSubmitting={edit.isSubmitting}
        error={edit.submitError || updateError}
      />
      <DeactivateCategoryModal
        isOpen={Boolean(deactivation.deactivatingCategory)}
        category={deactivation.deactivatingCategory}
        impact={deactivation.impact}
        isLoadingImpact={deactivation.isLoadingImpact}
        impactError={deactivation.impactError}
        onClose={deactivation.handleCloseDeactivate}
        onConfirm={deactivation.handleConfirmDeactivate}
        isSubmitting={deactivation.isSubmitting}
        error={deactivation.deactivateError || deactivateError}
      />
    </>
  );
}

export function CategoriesPage({
  categories = [],
  isLoading = false,
  error = null,
  onRetry,
  onCreateCategory,
  createError = null,
  onUpdateCategory,
  updateError = null,
  onGetImpact,
  onDeactivateCategory,
  deactivateError = null,
}: CategoriesPageProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const creation = useCategoriesCreation(onCreateCategory, setSuccessMessage);
  const edit = useCategoriesEdit(onUpdateCategory, setSuccessMessage);
  const deactivation = useCategoriesDeactivation(onGetImpact, onDeactivateCategory, setSuccessMessage);

  return (
    <section aria-label={translations.categories.title} className="max-w-6xl space-y-6">
      <CategoriesHeader onOpenModal={() => creation.setIsModalOpen(true)} />

      {successMessage && <CategoriesSuccessAlert message={successMessage} />}

      {isLoading && <CategoriesLoading />}

      {!isLoading && error && <CategoriesError error={error} onRetry={onRetry} />}

      {!isLoading && !error && categories.length === 0 && <CategoriesEmpty />}

      {!isLoading && !error && categories.length > 0 && (
        <CategoriesTable
          categories={categories}
          onEditCategory={edit.handleOpenEdit}
          onDeactivateCategory={deactivation.handleOpenDeactivate}
        />
      )}

      <CategoriesModals
        creation={creation}
        edit={edit}
        deactivation={deactivation}
        createError={createError}
        updateError={updateError}
        deactivateError={deactivateError}
      />
    </section>
  );
}


