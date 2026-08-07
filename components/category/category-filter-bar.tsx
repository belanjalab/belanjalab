import Link from "next/link";

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

export default function CategoryFilterBar({
  actionPath,
  brands,
  brand,
  minPrice,
  maxPrice,
  sort,
}: CategoryFilterBarProps) {
  const hasFilters = Boolean(
    brand ||
      minPrice !== null ||
      maxPrice !== null ||
      sort !== "recommended",
  );

  return (
    <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <form
        action={actionPath}
        method="get"
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1fr_1.1fr_auto]"
      >
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
            Merek
          </span>
          <select
            name="brand"
            defaultValue={brand}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
          >
            <option value="">Semua merek</option>
            {brands.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name} ({option.count})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
            Harga minimum
          </span>
          <input
            type="number"
            min="0"
            step="1000"
            name="min"
            defaultValue={minPrice ?? ""}
            placeholder="Contoh 1000000"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-400"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
            Harga maksimum
          </span>
          <input
            type="number"
            min="0"
            step="1000"
            name="max"
            defaultValue={maxPrice ?? ""}
            placeholder="Contoh 5000000"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-400"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
            Urutkan
          </span>
          <select
            name="sort"
            defaultValue={sort}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
          >
            <option value="recommended">Rekomendasi</option>
            <option value="score-desc">Skor tertinggi</option>
            <option value="price-asc">Harga terendah</option>
            <option value="price-desc">Harga tertinggi</option>
            <option value="newest">Produk terbaru</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="h-11 flex-1 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-slate-800"
          >
            Terapkan
          </button>
          {hasFilters && (
            <Link
              href={actionPath}
              className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 hover:border-orange-300 hover:text-orange-500"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <p className="mt-3 text-[10px] leading-5 text-slate-400 md:text-xs">
        Halaman hasil filter tetap dapat digunakan pengguna, tetapi tidak dibuat
        sebagai halaman SEO terpisah agar Google fokus pada landing page utama.
      </p>
    </div>
  );
}
