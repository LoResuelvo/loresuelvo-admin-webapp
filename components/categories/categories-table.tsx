import type { Category } from "@/domain/categories/category";
import { translations } from "@/infrastructure/i18n/translations";

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

function DeactivateIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  );
}

function CategoryTableHeader() {
  const copy = translations.categories;
  return (
    <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
      <tr>
        <th scope="col" className="px-6 py-4 w-28">
          {copy.columns.id}
        </th>
        <th scope="col" className="px-6 py-4">
          {copy.columns.name}
        </th>
        <th scope="col" className="px-6 py-4 w-32">
          {copy.columns.status}
        </th>
        <th scope="col" className="px-6 py-4 text-right w-28">
          <span className="sr-only">Acciones</span>
        </th>
      </tr>
    </thead>
  );
}

interface CategoryRowProps {
  category: Category;
  onEditCategory?: (category: Category) => void;
  onDeactivateCategory?: (category: Category) => void;
}

function CategoryRow({ category, onEditCategory, onDeactivateCategory }: CategoryRowProps) {
  const copy = translations.categories;
  const isActive = category.enabled !== false;

  return (
    <tr className="transition-colors hover:bg-[#F4F1EE]/30">
      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-[#1A2B48]/60">
        {category.id}
      </td>
      <td className="px-6 py-4 font-medium text-[#1A2B48]">
        {category.name}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {isActive ? copy.status.active : copy.status.inactive}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right">
        <div className="inline-flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEditCategory?.(category)}
            aria-label={`Editar rubro ${category.name}`}
            className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#1A2B48]/60 transition-colors hover:bg-[#F4F1EE] hover:text-[#1A2B48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
          >
            <EditIcon />
          </button>
          {isActive && (
            <button
              type="button"
              onClick={() => onDeactivateCategory?.(category)}
              aria-label={`Desactivar rubro ${category.name}`}
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#1A2B48]/60 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              <DeactivateIcon />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export interface CategoriesTableProps {
  categories: readonly Category[];
  onEditCategory?: (category: Category) => void;
  onDeactivateCategory?: (category: Category) => void;
}

export function CategoriesTable({
  categories,
  onEditCategory,
  onDeactivateCategory,
}: CategoriesTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs">
      <table className="w-full text-left text-sm text-[#1A2B48]">
        <CategoryTableHeader />
        <tbody className="divide-y divide-[#1A2B48]/5">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onEditCategory={onEditCategory}
              onDeactivateCategory={onDeactivateCategory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}


