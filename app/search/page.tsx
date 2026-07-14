import Link from "next/link";
import { searchProducts } from "@/lib/search-products";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim() ?? "";
  const products = query.length >= 2 ? await searchProducts(query) : [];

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />

            <span className="hidden text-lg font-black sm:inline md:text-xl">
              Belanja<span className="text-orange-500">Lab</span>
            </span>
          </Link>

          <form action="/search" method="get" className="flex flex-1">
            <label htmlFor="search" className="sr-only">
              Cari produk
            </label>

            <div className="flex w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-orange-400 focus-within:bg-white">
              <span className="flex items-center px-3 text-slate-400">
                ⌕
              </span>

              <input
                id="search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Cari produk, merek, atau kategori..."
                minLength={2}
                maxLength={80}
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600 md:px-6 md:text-sm"
              >
                Cari
              </button>
            </div>
          </form>
        </div>
      </header>

      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Pencarian Produk
          </p>

          {query.length >= 2 ? (
            <>
              <h1 className="mt-2 text-2xl font-black md:text-4xl">
                Hasil untuk “{query}”
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {products.length} produk ditemukan
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-2xl font-black md:text-4xl">
                Cari produk yang kamu butuhkan
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Ketik minimal dua karakter untuk mencari produk berdasarkan
                nama atau deskripsi.
              </p>
            </>
          )}

          {query.length >= 2 && products.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link href={`/product/${product.slug}`}>
                    <div className="flex aspect-square items-center justify-center bg-slate-100 p-4 md:p-7">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </Link>

                  <div className="p-3 md:p-5">
                    <p className="text-[9px] font-semibold text-slate-400 md:text-xs">
                      {product.brand} · {product.category}
                    </p>

                    <Link href={`/product/${product.slug}`}>
                      <h2 className="mt-1 line-clamp-2 min-h-10 text-xs font-black leading-5 hover:text-orange-500 md:min-h-12 md:text-base md:leading-6">
                        {product.name}
                      </h2>
                    </Link>

                    <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-slate-500 md:text-xs md:leading-5">
                      {product.shortDescription}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[8px] text-slate-400 md:text-[10px]">
                          Harga mulai
                        </p>
                        <p className="mt-1 text-xs font-black text-orange-500 md:text-base">
                          {product.formattedPrice}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[9px] font-black text-green-700 md:text-xs">
                        {product.score !== null
                          ? `${product.score.toFixed(1)}/10`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {query.length >= 2 && products.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="text-4xl">⌕</div>

              <h2 className="mt-3 text-lg font-black">
                Produk belum ditemukan
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Coba gunakan kata kunci yang lebih pendek atau nama produk
                yang berbeda.
              </p>

              <Link
                href="/"
                className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Kembali ke Beranda
              </Link>
            </div>
          )}

          {query.length < 2 && (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Mouse gaming", "Cari berdasarkan jenis produk"],
                ["Logitech", "Cari berdasarkan merek"],
                ["Wireless", "Cari berdasarkan kebutuhan"],
              ].map(([keyword, description]) => (
                <Link
                  key={keyword}
                  href={`/search?q=${encodeURIComponent(keyword)}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-orange-300"
                >
                  <p className="text-sm font-black">{keyword}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {[
          ["⌂", "Beranda", "/"],
          ["▦", "Kategori", "/#kategori"],
          ["⌕", "Cari", "/search"],
          ["⇄", "Compare", "/compare"],
          ["▤", "Artikel", "/#artikel"],
        ].map(([icon, label, href], index) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 text-[9px] ${
              index === 2 ? "text-orange-500" : "text-slate-500"
            }`}
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
