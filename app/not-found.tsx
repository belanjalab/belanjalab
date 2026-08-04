import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <div className="max-w-lg text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
          Halaman mungkin sudah dipindahkan, dihapus, atau alamatnya tidak tepat.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
