import Link from "next/link";
import { SearchIcon } from "@/components/home/home-icons";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="konten-utama" className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
        <section className="public-card w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <SearchIcon className="h-7 w-7" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
            Error 404
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Halaman mungkin sudah dipindahkan, dihapus, atau alamatnya tidak tepat.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
            >
              Kembali ke beranda
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-extrabold text-slate-700 hover:border-amber-300 hover:text-amber-800"
            >
              Cari produk
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
