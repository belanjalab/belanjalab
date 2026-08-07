"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type {
  CategoryBrandOption,
  CategorySort,
} from "@/lib/categories";

type CategoryFilterBarProps = {
  actionPath: string;
  brands: CategoryBrandOption[];
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: CategorySort;
};

const quickSorts: Array<{ value: CategorySort; label: string }> = [
  { value: "recommended", label: "Rekomendasi" },
  { value: "score-desc", label: "Skor" },
  { value: "newest", label: "Terbaru" },
];

function FilterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function buildSortHref(
  actionPath: string,
  nextSort: CategorySort,
  filters: {
    brand: string;
    minPrice: number | null;
    maxPrice: number | null;
  },
) {
  const params = new URLSearchParams();

  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (nextSort !== "recommended") params.set("sort", nextSort);

  const query = params.toString();
  return query ? `${actionPath}?${query}` : actionPath;
}

export default function CategoryFilterBar({
  actionPath,
  brands,
  brand,
  minPrice,
  maxPrice,
  sort,
}: CategoryFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeFilterCount =
    Number(Boolean(brand)) +
    Number(minPrice !== null) +
    Number(maxPrice !== null);
  const hasAnySelection = activeFilterCount > 0 || sort !== "recommended";
  const preservedFilters = { brand, minPrice, maxPrice };

  useEffect(() => {
    if (!isFilterOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFilterOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFilterOpen]);

  return (
    <>
      <div className="category-filter-sticky sticky top-[7.25rem] z-30 mb-5 md:top-[4.5rem]">
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="category-filter-scroll flex items-center gap-2 overflow-x-auto">
            <span className="hidden shrink-0 px-2 text-xs font-semibold text-slate-500 lg:inline">
              Urutkan
            </span>

            {quickSorts.map((option) => {
              const isActive = sort === option.value;

              return (
                <Link
                  key={option.value}
                  href={buildSortHref(actionPath, option.value, preservedFilters)}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}

            <form action={actionPath} method="get" className="shrink-0">
              {brand && <input type="hidden" name="brand" value={brand} />}
              {minPrice !== null && (
                <input type="hidden" name="min" value={minPrice} />
              )}
              {maxPrice !== null && (
                <input type="hidden" name="max" value={maxPrice} />
              )}
              <label className="sr-only" htmlFor="category-price-sort">
                Urutkan berdasarkan harga
              </label>
              <select
                id="category-price-sort"
                name="sort"
                key={sort}
                defaultValue={
                  sort === "price-asc" || sort === "price-desc" ? sort : ""
                }
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
                className={`h-10 cursor-pointer rounded-lg border px-3 text-sm font-semibold outline-none transition ${
                  sort === "price-asc" || sort === "price-desc"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-transparent bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <option value="" disabled>
                  Harga
                </option>
                <option value="price-asc">Harga terendah</option>
                <option value="price-desc">Harga tertinggi</option>
              </select>
            </form>

            <div className="ml-auto flex shrink-0 items-center gap-2 pl-1">
              {hasAnySelection && (
                <Link
                  href={actionPath}
                  className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Reset
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                aria-expanded={isFilterOpen}
                aria-controls="category-filter-dialog"
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition ${
                  activeFilterCount > 0
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <FilterIcon />
                Filter
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-700 px-1 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Tutup panel filter"
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
          />

          <section
            id="category-filter-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-filter-title"
            className="category-filter-panel absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(92vw,36rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Filter produk
                </p>
                <h2 id="category-filter-title" className="mt-1 text-lg font-bold text-slate-950">
                  Saring pilihanmu
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Tutup filter"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              >
                <CloseIcon />
              </button>
            </div>

            <form action={actionPath} method="get" className="p-5 sm:p-6">
              {sort !== "recommended" && (
                <input type="hidden" name="sort" value={sort} />
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  Merek
                </span>
                <select
                  name="brand"
                  defaultValue={brand}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                >
                  <option value="">Semua merek</option>
                  {brands.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="mt-5">
                <legend className="text-sm font-semibold text-slate-800">
                  Rentang harga
                </legend>
                <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <label>
                    <span className="sr-only">Harga minimum</span>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100">
                      <span className="mr-2 text-sm font-semibold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        name="min"
                        defaultValue={minPrice ?? ""}
                        inputMode="numeric"
                        placeholder="Minimum"
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>
                  <span aria-hidden="true" className="text-slate-300">
                    –
                  </span>
                  <label>
                    <span className="sr-only">Harga maksimum</span>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100">
                      <span className="mr-2 text-sm font-semibold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        name="max"
                        defaultValue={maxPrice ?? ""}
                        inputMode="numeric"
                        placeholder="Maksimum"
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>
                </div>
              </fieldset>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Link
                  href={actionPath}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hapus filter
                </Link>
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Tampilkan produk
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
