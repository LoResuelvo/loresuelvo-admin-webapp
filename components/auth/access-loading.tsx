import { translations } from "@/infrastructure/i18n/translations";

export function AccessLoading() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#F4F1EE] px-6 text-[#1A2B48]">
      <div role="status" className="max-w-md text-center">
        <span aria-hidden="true" className="mx-auto mb-6 block size-10 rounded-full border-2 border-[#147560]/20 border-t-[#147560] motion-safe:animate-spin" />
        <p className="text-lg font-medium">{translations.auth.verifying}</p>
      </div>
    </main>
  );
}
