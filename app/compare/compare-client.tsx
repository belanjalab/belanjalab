"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  ArrowRightIcon,
  CloseIcon,
  CompareIcon,
  SearchIcon,
  ScoreIcon,
} from "@/components/home/home-icons";
import type { CompareProduct } from "@/lib/products";

type CompareClientProps = {
  products: CompareProduct[];
  initialProductSlugs?: string[];
};

const specificationRows = [
  { key: "sensor", label: "Sensor" },
  { key: "connection", label: "Koneksi" },
  { key: "weight", label: "Berat" },
  { key: "rgb", label: "RGB" },
  { key: "buttons", label: "Tombol" },
  { key: "warranty", label: "Garansi" },
];

export default function CompareClient({
  products,
  initialProductSlugs = [],
}: CompareClientProps) {
  const [selectedProducts, setSelectedProducts] = useState<CompareProduct[]>(
    () =>
      initialProductSlugs.flatMap((slug) => {
        const product = products.find((item) => item.slug === slug);
        return product ? [product] : [];
      }),
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const availableProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const isSelected = selectedProducts.some(
        (selected) => selected.id === product.id,
      );

      if (isSelected) return false;
      if (!normalizedQuery) return true;

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, searchQuery, selectedProducts]);

  const comparedCategories = useMemo(
    () =>
      Array.from(
        new Set(selectedProducts.map((product) => product.category.trim())),
      ),
    [selectedProducts],
  );

  const topScoredProduct = useMemo(
    () =>
      selectedProducts.length > 0
        ? [...selectedProducts].sort((a, b) => b.score - a.score)[0]
        : null,
    [selectedProducts],
  );

  const lowestPriceProductId = useMemo(() => {
    const withPrice = selectedProducts.filter(
      (product): product is CompareProduct & { price: number } =>
        typeof product.price === "number",
    );
    if (withPrice.length < 2) return null;
    return withPrice.sort((a, b) => a.price - b.price)[0].id;
  }, [selectedProducts]);

  const highestScoreProductId = useMemo(() => {
    if (selectedProducts.length < 2) return null;
    const maxScore = Math.max(...selectedProducts.map((product) => product.score));
    const winners = selectedProducts.filter((product) => product.score === maxScore);
    return winners.length === 1 ? winners[0].id : null;
  }, [selectedProducts]);

  function removeProduct(productId: string) {
    setSelectedProducts((current) =>
      current.filter((product) => product.id !== productId),
    );
  }

  function addProduct(product: CompareProduct) {
    setSelectedProducts((current) => {
      if (current.length >= 3 || current.some((item) => item.id === product.id)) {
        return current;
      }
      return [...current, product];
    });
    setIsPickerOpen(false);
    setSearchQuery("");
  }

  return (
    <>
      <section className="px-4 pb-6 md:px-5 md:pb-10">
        <div className="mx-auto max-w-7xl">
          {comparedCategories.length > 1 && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Produk berasal dari kategori berbeda. Gunakan hasil ini sebagai gambaran umum, bukan perbandingan spesifikasi langsung.
            </div>
          )}

          {selectedProducts.length > 0 ? (
            <div className="category-rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:px-0">
              {selectedProducts.map((product) => (
                <article
                  key={product.id}
                  className="public-card relative w-[72vw] max-w-xs shrink-0 rounded-2xl border border-slate-200 bg-white p-4 md:w-auto md:max-w-none md:p-5"
                >
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    aria-label={`Hapus ${product.name}`}
                    className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>

                  <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-5 ring-1 ring-inset ring-slate-100 md:h-48">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-amber-700">
                    {product.category}
                  </p>
                  <h2 className="mt-1.5 min-h-12 text-base font-extrabold leading-6 tracking-[-0.02em] text-slate-950">
                    {product.name}
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500">Harga mulai</p>
                      <p className="mt-1 text-sm font-extrabold text-slate-950">
                        {product.formattedPrice}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                      <p className="flex items-center gap-1 text-xs font-semibold text-emerald-800">
                        <ScoreIcon className="h-3.5 w-3.5" /> Skor
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-emerald-800">
                        {product.score.toFixed(1)}/10
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/product/${product.slug}`}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white transition hover:bg-slate-800"
                  >
                    Lihat analisis <ArrowRightIcon />
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="public-card rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <CompareIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                Belum ada produk yang dipilih
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tambahkan dua atau tiga produk untuk mulai melihat perbedaannya.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsPickerOpen((current) => !current);
              setSearchQuery("");
            }}
            disabled={selectedProducts.length >= 3 || products.length === 0}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span aria-hidden="true" className="text-lg">+</span>
            {selectedProducts.length >= 3 ? "Maksimal tiga produk" : "Tambahkan produk"}
          </button>

          {isPickerOpen && (
            <section aria-label="Pilih produk" className="public-card mt-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-[-0.02em] text-slate-950">
                    Pilih produk
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Maksimal tiga produk dalam satu perbandingan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPickerOpen(false);
                    setSearchQuery("");
                  }}
                  aria-label="Tutup pemilih produk"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <label className="mt-5 flex min-h-12 items-center rounded-xl border border-slate-300 px-3 focus-within:border-amber-700 focus-within:ring-4 focus-within:ring-amber-100">
                <SearchIcon className="h-5 w-5 shrink-0 text-slate-500" />
                <span className="sr-only">Cari produk untuk dibandingkan</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Cari nama atau kategori produk..."
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-500"
                />
              </label>

              {availableProducts.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {availableProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="flex min-h-20 items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-amber-300 hover:bg-amber-50"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-1 ring-1 ring-inset ring-slate-100">
                        <img
                          src={product.imageUrl}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm font-extrabold leading-5 text-slate-950">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-slate-500">
                          {product.formattedPrice}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-bold text-slate-700">Produk tidak ditemukan.</p>
                  <p className="mt-1 text-sm text-slate-600">Coba kata kunci lain.</p>
                </div>
              )}
            </section>
          )}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-10 md:px-5 md:py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
            Detail perbandingan
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Harga, skor, dan spesifikasi
          </h2>

          {selectedProducts.length > 0 ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-950 text-white">
                    <th scope="col" className="sticky left-0 z-20 w-44 bg-slate-950 px-4 py-4 font-extrabold">Aspek</th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} scope="col" className="min-w-44 px-4 py-4 font-extrabold">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <th scope="row" className="sticky left-0 z-10 bg-slate-50 px-4 py-4 font-bold text-slate-700">Harga</th>
                    {selectedProducts.map((product) => {
                      const isWinner = product.id === lowestPriceProductId;
                      return (
                        <td
                          key={product.id}
                          className={`px-4 py-4 font-extrabold ${
                            isWinner ? "bg-emerald-50 text-emerald-800" : "text-slate-950"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {product.formattedPrice}
                            {isWinner && (
                              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                Termurah
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-slate-100">
                    <th scope="row" className="sticky left-0 z-10 bg-slate-50 px-4 py-4 font-bold text-slate-700">BelanjaLab Score</th>
                    {selectedProducts.map((product) => {
                      const isWinner = product.id === highestScoreProductId;
                      return (
                        <td
                          key={product.id}
                          className={`px-4 py-4 font-extrabold ${
                            isWinner ? "bg-emerald-50 text-emerald-800" : "text-emerald-800"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {product.score.toFixed(1)}/10
                            {isWinner && (
                              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                Tertinggi
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  {specificationRows.map((row) => (
                    <tr key={row.key} className="border-b border-slate-100 last:border-b-0">
                      <th scope="row" className="sticky left-0 z-10 bg-slate-50 px-4 py-4 font-bold text-slate-700">{row.label}</th>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="px-4 py-4 font-semibold text-slate-700">
                          {product.specifications[row.key] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Tambahkan produk untuk melihat tabel perbandingan.
            </p>
          )}
        </div>
      </section>

      {selectedProducts.length >= 2 && topScoredProduct && (
        <section className="px-4 py-10 md:px-5 md:py-14">
          <div className="quick-compare-surface mx-auto max-w-7xl rounded-3xl border border-slate-200 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
              Ringkasan sementara
            </p>
            <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                  {topScoredProduct.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Memiliki skor tertinggi di antara produk yang sedang dipilih. Tetap periksa kebutuhan, harga, dan spesifikasi sebelum memutuskan.
                </p>
              </div>
              <a
                href={`/product/${topScoredProduct.slug}`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                Lihat analisis <ArrowRightIcon />
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
