import Link from "next/link";

import { ScoreIcon } from "@/components/home/home-icons";
import type { CategoryProduct } from "@/lib/categories";

type CategoryProductGridProps = {
  products: CategoryProduct[];
  categoryName: string;
  basePath: string;
  currentPage: number;
  totalPages: number;
  query?: Record<string, string>;
};

function getPageHref(
  basePath: string,
  page: number,
  query: Record<string, string>,
) {
  const params = new URLSearchParams(query);

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
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
  basePath,
  currentPage,
  totalPages,
  query = {},
}: CategoryProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="text-lg font-bold text-slate-900">
          Belum ada pilihan {categoryName}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
          Coba hapus filter merek atau rentang harga untuk melihat pilihan lain.
        </p>
        <Link
          href={basePath}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Hapus filter
        </Link>
      </div>
    );
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <article
            key={product.id}
            className="public-card group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg"
          >
            <Link
              href={`/product/${product.slug}`}
              aria-label={`Lihat analisis ${product.name}`}
              className="block h-full"
            >
              <div className="flex aspect-square items-center justify-center bg-slate-50 p-4 ring-1 ring-inset ring-slate-100 sm:p-5">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-3 sm:p-4">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 sm:text-xs">
                  {product.brand}
                </p>

                <h2 className="mt-1.5 line-clamp-2 min-h-10 text-sm font-semibold leading-5 tracking-[-0.015em] text-slate-950 transition-colors group-hover:text-amber-800 sm:min-h-12 sm:text-base sm:leading-6">
                  {product.name}
                </h2>

                <p className="mt-2 hidden line-clamp-2 text-xs leading-5 text-slate-500 sm:block">
                  {product.shortDescription}
                </p>

                <div className="mt-3 flex items-end justify-between gap-2 border-t border-slate-100 pt-3 sm:mt-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                      Harga mulai
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-950 sm:text-base">
                      {product.formattedPrice}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-100 sm:px-2.5 sm:py-1.5 sm:text-xs">
                    <ScoreIcon className="h-3.5 w-3.5" />
                    {product.score !== null ? product.score.toFixed(1) : "—"}
                  </span>
                </div>
              </div>
            </Link>
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
              href={getPageHref(basePath, currentPage - 1, query)}
              className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-800"
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
                  <span className="px-1 text-sm text-slate-400">…</span>
                )}
                <Link
                  href={getPageHref(basePath, page, query)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                    page === currentPage
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-800"
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
              href={getPageHref(basePath, currentPage + 1, query)}
              className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-800"
            >
              Berikutnya
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
