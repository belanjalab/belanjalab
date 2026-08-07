import Link from "next/link";

import type { CategoryProduct } from "@/lib/categories";

type RecommendationProductGridProps = {
  products: CategoryProduct[];
  basePath: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  label: string;
};

function getPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
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

export default function RecommendationProductGrid({
  products,
  basePath,
  currentPage,
  totalPages,
  pageSize,
  label,
}: RecommendationProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
        <p className="text-lg font-black text-slate-800">
          Belum ada produk untuk {label}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          Halaman ini akan terisi otomatis ketika produk published dengan harga
          dan kategori yang sesuai tersedia di BelanjaLab.
        </p>
        <Link
          href="/kategori"
          className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
        >
          Jelajahi Kategori
        </Link>
      </div>
    );
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);
  const firstPosition = (currentPage - 1) * pageSize;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((product, index) => {
          const rank = firstPosition + index + 1;

          return (
            <article
              key={product.id}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="absolute left-3 top-3 z-10 flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-950 px-2 text-xs font-black text-white shadow-sm">
                #{rank}
              </div>

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
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Pagination rekomendasi"
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {currentPage > 1 && (
            <Link
              rel="prev"
              href={getPageHref(basePath, currentPage - 1)}
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
                  <span className="px-1 text-xs text-slate-400">...</span>
                )}
                <Link
                  href={getPageHref(basePath, page)}
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
              href={getPageHref(basePath, currentPage + 1)}
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
