"use client";

import { useEffect } from "react";

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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
          Terjadi gangguan
        </p>
        <h1 className="mt-3 text-3xl font-black">
          Halaman belum dapat dimuat
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Coba muat ulang halaman. Data kamu tidak berubah karena gangguan ini.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
        >
          Coba Lagi
        </button>
      </section>
    </main>
  );
}
