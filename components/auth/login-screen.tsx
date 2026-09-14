"use client";

import { useEffect, useState } from "react";
import { translations } from "@/infrastructure/i18n/translations";

type LoginScreenProps = {
  onSignIn: () => void;
  notice?: string;
};

export function LoginScreen({ onSignIn, notice }: LoginScreenProps) {
  const copy = translations.auth;
  const [attempt, setAttempt] = useState<"idle" | "redirecting" | "incomplete">("idle");
  const isRedirecting = attempt === "redirecting";
  const visibleNotice = attempt === "incomplete" ? copy.incomplete : notice;

  useEffect(() => {
    function restoreAttempt(event: PageTransitionEvent) {
      if (event.persisted && isRedirecting) setAttempt("incomplete");
    }
    window.addEventListener("pageshow", restoreAttempt);
    return () => window.removeEventListener("pageshow", restoreAttempt);
  }, [isRedirecting]);

  function startSignIn() {
    if (isRedirecting) return;
    setAttempt("redirecting");
    onSignIn();
  }

  return (
    <main className="grid min-h-svh grid-rows-[auto_1fr] bg-[#F4F1EE] text-[#1A2B48] lg:grid-cols-[1fr_1.05fr] lg:grid-rows-1">
      <section className="relative isolate flex flex-col overflow-hidden bg-[#1A2B48] px-6 py-8 text-[#F4F1EE] sm:px-12 lg:min-h-svh lg:p-16">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/25 text-xl text-[#E8C479]">↗</span>
          <p className="text-xl font-semibold tracking-tight">{copy.brand}</p>
        </div>
        <div className="relative z-10 hidden max-w-md py-20 lg:my-auto lg:block">
          <div aria-hidden="true" className="mb-8 h-1 w-12 rounded-full bg-[#E8C479]" />
          <p className="text-5xl font-medium leading-[1.15] tracking-tight xl:text-6xl">{copy.brandMessage}</p>
          <p className="mt-6 max-w-xs text-base leading-relaxed text-[#C9D3DF]">{copy.brandDescription}</p>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 -z-10 hidden size-[32rem] rounded-full border border-white/10 lg:block">
          <div className="absolute inset-12 rounded-full border border-white/10" />
          <div className="absolute inset-24 rounded-full border border-white/10" />
        </div>
      </section>

      <section aria-labelledby="login-heading" className="flex min-w-0 flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <p className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#147560]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {copy.area}
          </p>
          <h1 id="login-heading" className="max-w-sm text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{copy.heading}</h1>
          <p className="mt-5 text-base leading-relaxed text-[#536176]">{copy.description}</p>
          {visibleNotice && <p role="alert" className="mt-6 rounded-xl border border-[#1A2B48]/15 bg-white p-4 text-sm leading-relaxed text-[#1A2B48]">{visibleNotice}</p>}
          <button
            type="button"
            onClick={startSignIn}
            disabled={isRedirecting}
            aria-busy={isRedirecting}
            className="mt-10 flex min-h-14 w-full items-center justify-between gap-4 rounded-xl bg-[#147560] px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#147560] motion-reduce:transition-none disabled:cursor-wait disabled:opacity-75"
          >
            {copy.signIn}
            <span aria-hidden="true" className="text-xl">→</span>
          </button>
          {isRedirecting && <p role="status" className="mt-4 text-sm text-[#536176]">{copy.redirecting}</p>}
          <p className="mt-8 border-t border-[#1A2B48]/15 pt-6 text-sm leading-relaxed text-[#536176]">{copy.accessNotice}</p>
        </div>
      </section>
    </main>
  );
}
