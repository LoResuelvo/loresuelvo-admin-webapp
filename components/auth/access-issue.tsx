import { translations } from "@/infrastructure/i18n/translations";

export function AccessIssue({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-[#F4F1EE] px-6 py-12 text-[#1A2B48]">
      <section className="w-full max-w-lg rounded-3xl border border-[#1A2B48]/10 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-[#147560]">{translations.auth.brand} · {translations.auth.area}</p>
        <p role="alert" className="text-lg leading-relaxed">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-8 min-h-14 w-full rounded-xl bg-[#147560] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#147560] motion-reduce:transition-none">
            {translations.auth.retry}
          </button>
        )}
      </section>
    </main>
  );
}
