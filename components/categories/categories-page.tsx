import type { Category } from "@/domain/categories/category";
import { translations } from "@/infrastructure/i18n/translations";

export type CategoriesPageProps = {
  categories?: Category[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

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

export function CategoriesPage({
  categories = [],
  isLoading = false,
  error = null,
  onRetry,
}: CategoriesPageProps) {
  return (
    <section aria-label={translations.categories.title} className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
          {translations.categories.title}
        </h1>
      </div>

      {isLoading && <CategoriesLoading />}

      {!isLoading && error && <CategoriesError error={error} onRetry={onRetry} />}

      {!isLoading && !error && categories.length === 0 && (
        <div
          role="status"
          className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs"
        >
          <p className="text-base font-medium text-[#1A2B48]/80">
            {translations.categories.empty}
          </p>
        </div>
      )}

      {!isLoading && !error && categories.length > 0 && (
        <CategoriesTable categories={categories} />
      )}
    </section>
  );
}
