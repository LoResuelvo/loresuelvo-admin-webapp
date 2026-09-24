"use client";

import { useState } from "react";
import type { Category } from "@/domain/categories/category";
import { CreateCategoryModal } from "@/components/categories/create-category-modal";
import { EditCategoryModal } from "@/components/categories/edit-category-modal";
import { CategoriesTable } from "@/components/categories/categories-table";
import {
  CategoriesEmpty,
  CategoriesError,
  CategoriesLoading,
  CategoriesSuccessAlert,
} from "@/components/categories/categories-feedback";
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

function useCategoriesCreation(
  onCreateCategory: ((name: string) => Promise<void>) | undefined,
  onSuccess: (msg: string) => void,
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCreate = async (name: string) => {
    if (!onCreateCategory) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onCreateCategory(name);
      setIsModalOpen(false);
      onSuccess(translations.categories.createSuccess);
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
    handleCreate,
    handleCloseModal,
  };
}

function useCategoriesEdit(
  onUpdateCategory: ((id: number, name: string) => Promise<void>) | undefined,
  onSuccess: (msg: string) => void,
) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setSubmitError(null);
  };

  const handleCloseEdit = () => {
    if (isSubmitting) return;
    setEditingCategory(null);
    setSubmitError(null);
  };

  const handleUpdate = async (id: number, name: string) => {
    if (!onUpdateCategory) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onUpdateCategory(id, name);
      setEditingCategory(null);
      onSuccess(translations.categories.updateSuccess);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar rubro";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    editingCategory,
    isSubmitting,
    submitError,
    handleOpenEdit,
    handleCloseEdit,
    handleUpdate,
  };
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
}: CategoriesPageProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const creation = useCategoriesCreation(onCreateCategory, setSuccessMessage);
  const edit = useCategoriesEdit(onUpdateCategory, setSuccessMessage);

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
        />
      )}

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
    </section>
  );
}
