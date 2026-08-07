import Link from "next/link";

import type { CategoryProduct } from "@/lib/categories";

type CategoryProductGridProps = {
  products: CategoryProduct[];
  categoryName: string;
  categorySlug: string;
  currentPage: number;
  totalPages: number;
};

function getPageHref(slug: string, page: number) {
  return page <= 1
    ? `/kategori/${encodeURIComponent(slug)}`
    : `/kategori/${encodeURIComponent(slug)}?page=${page}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const candidates = new Set([
    1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    totalPages,
  ]);

  return Array.from(candidates)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export default function CategoryProductGrid({
  products,
  categoryName,
  categorySlug,
  currentPage,
  totalPages,
}: CategoryProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
        <p className="text-lg font-black text-slate-800">
          Produk {categoryName} belum tersedia
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          Produk published pada kategori ini akan otomatis tampil di sini.
          Kamu tetap bisa mencari produk lain melalui pencarian BelanjaLab.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
        >
          Cari Produk
        </Link>
      </div>
    );
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
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
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <div className="p-3 md:p-5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 md:text-xs">
                {product.brand}
              </p>

              <Link href={`/product/${product.slug}`}>
                <h2 className="mt-1 line-clamp-2 min-h-10 text-xs font-black leading-5 text-slate-900 hover:text-orange-500 md:min-h-12 md:text-base md:leading-6">
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
                    : "Belum dinilai"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Pagination kategori"
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {currentPage > 1 && (
            <Link
              rel="prev"
              href={getPageHref(categorySlug, currentPage - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
            >
              Sebelumnya
            </Link>
          )}

          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];
            const showGap = previousPage && page - previousPage > 1;

            return (
              <span key={page} className="contents">
                {showGap && (
                  <span className="px-1 text-xs text-slate-400">…</span>
                )}
                <Link
                  href={getPageHref(categorySlug, page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-black ${
                    page === currentPage
                      ? "bg-orange-500 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  }`}
                >
                  {page}
                </Link>
              </span>
            );
          })}

          {currentPage < totalPages && (
            <Link
              rel="next"
              href={getPageHref(categorySlug, currentPage + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
            >
              Berikutnya
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
