"use client";

import { useEffect } from "react";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("BelanjaLab page error:", error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main id="konten-utama" className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
        <section className="public-card w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
            Terjadi gangguan
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Halaman belum dapat dimuat
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Coba muat ulang halaman. Data kamu tidak berubah karena gangguan ini.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-700 px-5 text-sm font-extrabold text-white hover:bg-orange-800"
          >
            Coba lagi
          </button>
        </section>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
