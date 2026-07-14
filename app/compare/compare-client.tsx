"use client";

import { useMemo, useState } from "react";
import type { CompareProduct } from "@/lib/products";

type CompareClientProps = {
  products: CompareProduct[];
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
}: CompareClientProps) {
  const [selectedProducts, setSelectedProducts] = useState(
    products.slice(0, 3),
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const availableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          !selectedProducts.some(
            (selected) => selected.id === product.id,
          ),
      ),
    [products, selectedProducts],
  );

  function removeProduct(productId: string) {
    setSelectedProducts((current) =>
      current.filter((product) => product.id !== productId),
    );
  }

  function addProduct(product: CompareProduct) {
    setSelectedProducts((current) => {
      if (current.length >= 3) {
        return current;
      }

      if (current.some((item) => item.id === product.id)) {
        return current;
      }

      return [...current, product];
    });

    setIsPickerOpen(false);
  }

  const columnCount = Math.max(selectedProducts.length, 1);

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 md:px-5 md:py-4">
          <a href="/" className="mr-3 text-lg md:hidden">
            ‹
          </a>

          <a href="/" className="flex items-center gap-2">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-7 w-7 rounded-full object-cover md:h-10 md:w-10"
            />

            <span className="text-sm font-black md:text-xl">
              Belanja<span className="text-orange-500">Lab</span>
            </span>
          </a>

          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="/#kategori" className="hover:text-slate-950">
              Kategori
            </a>
            <a href="/compare" className="text-orange-500">
              Perbandingan
            </a>
            <a href="/#artikel" className="hover:text-slate-950">
              Artikel
            </a>
          </nav>

          <button
            type="button"
            aria-label="Bagikan"
            className="ml-auto text-lg"
          >
            ↗
          </button>
        </div>
      </header>

      <section className="px-4 py-5 md:px-5 md:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 md:text-sm md:tracking-[0.2em]">
            Bandingkan sebelum membeli
          </p>

          <h1 className="mt-2 text-xl font-black leading-tight md:mt-3 md:max-w-3xl md:text-5xl">
            Temukan produk yang paling cocok untuk kebutuhanmu.
          </h1>

          <p className="mt-3 max-w-2xl text-[10px] leading-5 text-slate-500 md:mt-5 md:text-base md:leading-7">
            Bandingkan harga, skor, dan spesifikasi hingga tiga produk.
          </p>
        </div>
      </section>

      <section className="px-4 pb-5 md:px-5 md:pb-10">
        <div className="mx-auto max-w-7xl">
          {selectedProducts.length > 0 ? (
            <div
              className="grid gap-2 md:gap-5"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              }}
            >
              {selectedProducts.map((product) => (
                <article
                  key={product.id}
                  className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:rounded-3xl md:p-5"
                >
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    aria-label={`Hapus ${product.name}`}
                    className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 hover:bg-slate-50 md:right-4 md:top-4 md:h-8 md:w-8 md:text-sm"
                  >
                    ×
                  </button>

                  <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-slate-100 md:h-44 md:rounded-2xl">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain p-2 md:p-5"
                    />
                  </div>

                  <p className="mt-2 text-[8px] text-slate-400 md:mt-5 md:text-xs">
                    {product.category}
                  </p>

                  <h2 className="mt-1 min-h-8 text-[9px] font-black leading-4 md:min-h-12 md:text-base md:leading-6">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-[10px] font-black text-orange-500 md:mt-4 md:text-2xl">
                    {product.formattedPrice}
                  </p>

                  <div className="mt-2 rounded-lg bg-green-50 px-2 py-2 text-center md:mt-4 md:rounded-xl md:px-4 md:py-3">
                    <p className="text-[8px] font-semibold text-green-700 md:text-[10px]">
                      BelanjaLab Score
                    </p>
                    <p className="mt-1 text-sm font-black text-green-600 md:text-xl">
                      {product.score.toFixed(1)}/10
                    </p>
                  </div>

                  <a
                    href={`/product/${product.slug}`}
                    className="mt-2 block rounded-lg bg-orange-500 px-2 py-2 text-center text-[8px] font-bold text-white hover:bg-orange-600 md:mt-5 md:rounded-xl md:px-4 md:py-3 md:text-sm"
                  >
                    Lihat Produk
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold">
                Belum ada produk yang dipilih.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tambahkan produk untuk mulai membandingkan.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsPickerOpen((current) => !current)}
            disabled={
              selectedProducts.length >= 3 ||
              availableProducts.length === 0
            }
            className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-[10px] font-bold text-slate-500 hover:border-orange-400 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40 md:mt-6 md:rounded-2xl md:px-6 md:py-5 md:text-sm"
          >
            + Tambahkan Produk
          </button>

          {isPickerOpen && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black md:text-lg">
                    Pilih Produk
                  </h2>
                  <p className="mt-1 text-[9px] text-slate-500 md:text-xs">
                    Maksimal tiga produk dalam satu perbandingan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-orange-400 hover:bg-orange-50"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-black md:text-sm">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-500 md:text-xs">
                        {product.formattedPrice}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-6 md:px-5 md:py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-base font-black md:text-3xl">
            Perbandingan Spesifikasi
          </h2>

          {selectedProducts.length > 0 ? (
            <div className="mt-4 space-y-4 md:mt-7">
              <div>
                <h3 className="text-[10px] font-black md:text-sm">
                  Harga
                </h3>

                <div
                  className="mt-2 grid overflow-hidden rounded-xl border border-slate-200 bg-white"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {selectedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`px-2 py-3 text-center text-[9px] font-semibold md:px-5 md:py-5 md:text-sm ${
                        index !== selectedProducts.length - 1
                          ? "border-r border-slate-200"
                          : ""
                      }`}
                    >
                      {product.formattedPrice}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black md:text-sm">
                  BelanjaLab Score
                </h3>

                <div
                  className="mt-2 grid overflow-hidden rounded-xl border border-slate-200 bg-white"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {selectedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`px-2 py-3 text-center text-[9px] font-black text-green-600 md:px-5 md:py-5 md:text-sm ${
                        index !== selectedProducts.length - 1
                          ? "border-r border-slate-200"
                          : ""
                      }`}
                    >
                      {product.score.toFixed(1)}/10
                    </div>
                  ))}
                </div>
              </div>

              {specificationRows.map((row) => (
                <div key={row.key}>
                  <h3 className="text-[10px] font-black md:text-sm">
                    {row.label}
                  </h3>

                  <div
                    className="mt-2 grid overflow-hidden rounded-xl border border-slate-200 bg-white"
                    style={{
                      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                    }}
                  >
                    {selectedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className={`px-2 py-3 text-center text-[9px] font-semibold md:px-5 md:py-5 md:text-sm ${
                          index !== selectedProducts.length - 1
                            ? "border-r border-slate-200"
                            : ""
                        }`}
                      >
                        {product.specifications[row.key] ?? "—"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Tambahkan produk untuk melihat perbandingan.
            </p>
          )}
        </div>
      </section>

      {selectedProducts.length > 0 && (
        <section className="px-4 py-6 md:px-5 md:py-12">
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-slate-50 p-4 md:rounded-3xl md:p-8">
            <p className="text-[10px] font-black md:text-sm">
              Kesimpulan BelanjaLab
            </p>

            {(() => {
              const winner = [...selectedProducts].sort(
                (a, b) => b.score - a.score,
              )[0];

              return (
                <>
                  <h2 className="mt-2 text-lg font-black text-green-600 md:text-3xl">
                    {winner.name}
                  </h2>

                  <p className="mt-2 text-[10px] leading-5 text-slate-500 md:text-sm md:leading-7">
                    Produk dengan skor BelanjaLab tertinggi dari pilihan
                    yang sedang dibandingkan.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-500 px-4 py-2 text-[9px] font-bold text-white md:text-xs">
                      PEMENANG
                    </span>

                    <a
                      href={`/product/${winner.slug}`}
                      className="rounded-full bg-orange-500 px-4 py-2 text-[9px] font-bold text-white md:text-xs"
                    >
                      Lihat Produk
                    </a>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {[
          ["⌂", "Beranda", "/"],
          ["▦", "Kategori", "/#kategori"],
          ["⌕", "Cari", "#"],
          ["⇄", "Compare", "/compare"],
          ["▤", "Artikel", "/#artikel"],
        ].map(([icon, label, href], index) => (
          <a
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 text-[9px] ${
              index === 3
                ? "text-orange-500"
                : "text-slate-500"
            }`}
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </main>
  );
}
