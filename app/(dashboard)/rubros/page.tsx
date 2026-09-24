"use client";

import { CategoriesPage } from "@/components/categories/categories-page";
import { useRubrosPageState } from "./use-rubros-page-state";

export default function RubrosPage() {
  const state = useRubrosPageState();
  return <CategoriesPage {...state} />;
}
