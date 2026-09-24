"use client";

import { useState } from "react";
import type { Category } from "@/domain/categories/category";
import type { CategoryImpact } from "@/domain/categories/category-impact";
import { translations } from "@/infrastructure/i18n/translations";

export function useCategoriesCreation(
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

export function useCategoriesEdit(
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

type DeactivationState = {
  category: Category | null;
  impact: CategoryImpact | null;
  isLoadingImpact: boolean;
  impactError: string | null;
  isSubmitting: boolean;
  deactivateError: string | null;
};

const initialDeactivationState: DeactivationState = {
  category: null,
  impact: null,
  isLoadingImpact: false,
  impactError: null,
  isSubmitting: false,
  deactivateError: null,
};

export function useCategoriesDeactivation(
  onGetImpact: ((id: number) => Promise<CategoryImpact>) | undefined,
  onDeactivateCategory: ((id: number) => Promise<void>) | undefined,
  onSuccess: (msg: string) => void,
) {
  const [state, setState] = useState<DeactivationState>(initialDeactivationState);

  const handleOpenDeactivate = async (category: Category) => {
    setState({ ...initialDeactivationState, category, isLoadingImpact: Boolean(onGetImpact) });
    if (!onGetImpact) return;
    try {
      const impact = await onGetImpact(category.id);
      setState((prev) => ({ ...prev, impact, isLoadingImpact: false }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al obtener impacto";
      setState((prev) => ({ ...prev, impactError: msg, isLoadingImpact: false }));
    }
  };

  const handleCloseDeactivate = () => {
    if (state.isSubmitting) return;
    setState(initialDeactivationState);
  };

  const handleConfirmDeactivate = async (id: number) => {
    if (!onDeactivateCategory) return;
    setState((prev) => ({ ...prev, isSubmitting: true, deactivateError: null }));
    try {
      await onDeactivateCategory(id);
      setState(initialDeactivationState);
      onSuccess(translations.categories.deactivateSuccess);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al desactivar rubro";
      setState((prev) => ({ ...prev, isSubmitting: false, deactivateError: msg }));
    }
  };

  return {
    deactivatingCategory: state.category,
    impact: state.impact,
    isLoadingImpact: state.isLoadingImpact,
    impactError: state.impactError,
    isSubmitting: state.isSubmitting,
    deactivateError: state.deactivateError,
    handleOpenDeactivate,
    handleCloseDeactivate,
    handleConfirmDeactivate,
  };
}

