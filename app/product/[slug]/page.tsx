import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const specs = [
  ["Sensor 8.000 DPI", "Akurasi dan responsivitas tinggi"],
  ["RGB Lightsync", "Efek RGB yang bisa dikustomisasi"],
  ["6 Tombol", "Dapat diprogram melalui software"],
  ["Desain Ergonomis", "Nyaman digunakan untuk sesi panjang"],
];

const alternatives = [
  { name: "Fantech X9", price: "Rp165.000", score: "8.6/10" },
  { name: "Rexus Daxa Air", price: "Rp499.000", score: "8.9/10" },
  { name: "Logitech G203", price: "Rp299.000", score: "9.0/10" },
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const scoreRelation = Array.isArray(product.product_scores)
    ? product.product_scores[0]
    : product.product_scores;

  const overallScore = scoreRelation?.overall_score;

  const formattedScore =
    overallScore !== null && overallScore !== undefined
      ? Number(overallScore).toFixed(1)
      : "—";

  const categoryRelation = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories;

  const brandRelation = Array.isArray(product.brands)
    ? product.brands[0]
    : product.brands;

  const categoryName = categoryRelation?.name ?? "Produk";
  const brandName = brandRelation?.name ?? "Brand";

  const prices = Array.isArray(product.product_prices)
    ? product.product_prices
    : [];

  const numericPrices = prices
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));

  const lowestPrice =
    numericPrices.length > 0 ? Math.min(...numericPrices) : null;

  const formattedPrice =
    lowestPrice !== null
      ? formatRupiah(lowestPrice)
      : "Harga belum tersedia";

  const storePrices = prices
    .map((item) => {
      const marketplaceRelation = Array.isArray(item.marketplaces)
        ? item.marketplaces[0]
        : item.marketplaces;

      const price = Number(item.price);

      return {
        name: marketplaceRelation?.name ?? "Marketplace",
        price,
        formattedPrice: Number.isFinite(price)
          ? formatRupiah(price)
          : "Harga belum tersedia",
        url: item.affiliate_url ?? "#",
      };
    })
    .filter((item) => Number.isFinite(item.price))
    .sort((a, b) => a.price - b.price);

  const imageUrl =
    product.image_url ?? "/images/products/logitech-g102.png";

  const description =
    product.short_description ??
    product.description ??
    "Informasi produk belum tersedia.";

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
            <a href="/compare" className="hover:text-slate-950">
              Perbandingan
            </a>
            <a href="/#artikel" className="hover:text-slate-950">
              Artikel
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-3 text-lg">
            <button type="button" aria-label="Favorit">
              ♡
            </button>
            <button type="button" aria-label="Bagikan">
              ↗
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-3 md:px-5 md:py-5">
        <div className="text-[9px] text-slate-400 md:text-xs">
          Home / {categoryName} / {product.name}
        </div>
      </div>

      <section className="px-4 md:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 md:min-h-[420px] md:rounded-3xl">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain p-8 md:p-10"
                />
                <span className="absolute bottom-3 right-3 text-[9px] text-slate-400">
                  1/4
                </span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 md:mt-4 md:gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-orange-500 md:rounded-xl"
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} thumbnail ${item}`}
                      className="h-full w-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden flex-col justify-center lg:flex">
              <p className="text-sm font-semibold text-orange-500">
                {categoryName}
              </p>
              <h1 className="mt-3 text-5xl font-black leading-tight">
                {product.name}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {description}
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="rounded-xl bg-green-50 px-4 py-3">
                  <p className="text-xs font-semibold text-green-600">
                    Skor BelanjaLab
                  </p>
                  <p className="mt-1 text-3xl font-black text-green-600">
                    {formattedScore}/10
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold">⭐ 4.8 dari 5</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Berdasarkan 1.240 ulasan
                  </p>
                </div>
              </div>

              <div className="mt-7 border-y border-slate-200 py-6">
                <p className="text-sm text-slate-500">
                  Harga terbaik mulai dari
                </p>
                <p className="mt-1 text-3xl font-black text-orange-500">
                  {formattedPrice}
                </p>
              </div>

              <div className="mt-7 flex gap-3">
                <a
                  href="#harga"
                  className="rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white"
                >
                  Lihat Harga
                </a>
                <a
                  href="/compare"
                  className="rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-bold"
                >
                  Compare
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black leading-5">{product.name}</p>
          <div className="mt-2 flex items-center gap-2 text-[10px]">
            <span className="text-amber-400">★★★★★</span>
            <span className="font-semibold">4.8</span>
            <span className="text-slate-400">1.245 Review</span>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4 lg:hidden">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500">
                BelanjaLab Score
              </p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-3xl font-black">{formattedScore}</span>
                <span className="pb-1 text-xs font-semibold text-slate-400">
                  /10
                </span>
              </div>
            </div>

            <span className="rounded-full bg-green-500 px-3 py-1 text-[8px] font-bold text-white">
              SANGAT DIREKOMENDASIKAN
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-[9px]">
            <div>
              <p className="text-slate-400">Harga terbaik</p>
              <p className="mt-1 text-base font-black">{formattedPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Kategori</p>
              <p className="mt-1 font-bold">{categoryName}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-3 lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] gap-2">
          <a
            href="#harga"
            className="rounded-xl bg-orange-500 px-4 py-3 text-center text-xs font-bold text-white"
          >
            Lihat Harga
          </a>
          <a
            href="/compare"
            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-xs font-bold"
          >
            Compare
          </a>
        </div>
      </section>

      <section className="px-4 pt-4 md:px-5 md:pt-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 md:rounded-3xl md:p-7">
          <p className="text-[10px] font-bold md:text-sm">
            BelanjaLab Verdict
          </p>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-2xl font-black text-green-600 md:text-4xl">
              {formattedScore}
            </span>
            <span className="pb-1 text-xs font-semibold text-green-600">
              /10
            </span>
          </div>
          <p className="mt-1 text-[9px] font-semibold text-green-600 md:text-xs">
            Sangat direkomendasikan
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 text-[9px] md:text-sm">
            <div>
              <p className="mb-2 font-bold">Cocok untuk</p>
              <div className="space-y-2 text-slate-600">
                <p>✓ Gamer FPS</p>
                <p>✓ Penggunaan harian</p>
                <p>✓ Budget terbatas</p>
              </div>
            </div>
            <div>
              <p className="mb-2 font-bold">Tidak cocok untuk</p>
              <div className="space-y-2 text-slate-600">
                <p>× Desain profesional</p>
                <p>× Tangan terlalu besar</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-orange-50 px-3 py-2 text-center text-[9px] font-semibold text-orange-600 md:text-xs">
            ★ Terbaik untuk value di kelasnya
          </div>
        </div>
      </section>

      <section className="px-4 pt-4 md:px-5 md:pt-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 md:rounded-3xl md:p-7">
          <div className="flex gap-5 border-b border-slate-200 pb-3 text-[9px] md:text-sm">
            <button className="font-bold text-orange-500">Ringkasan</button>
            <button className="text-slate-400">Spesifikasi</button>
            <button className="text-slate-400">Kelebihan</button>
          </div>

          <h2 className="mt-4 text-sm font-black md:text-2xl">Ringkasan</h2>
          <p className="mt-2 text-[10px] leading-5 text-slate-600 md:text-sm md:leading-7">
            {product.description ?? description}
          </p>

          <div className="mt-4 space-y-3">
            {specs.map(([title, desc]) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-[10px] font-bold md:text-sm">{title}</p>
                <p className="mt-1 text-[9px] text-slate-500 md:text-xs">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="harga" className="px-4 py-8 md:px-5 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-lg font-black md:text-3xl">
            Bandingkan Harga
          </h2>
          <p className="mt-1 text-[10px] text-slate-500 md:text-sm">
            Pilih marketplace dengan penawaran terbaik.
          </p>

          {storePrices.length > 0 ? (
            <div className="mt-5 grid gap-3 md:mt-7 md:gap-4">
              {storePrices.map((store) => (
                <div
                  key={`${store.name}-${store.price}`}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center md:p-5"
                >
                  <div className="flex-1">
                    <p className="text-sm font-black md:text-lg">
                      {store.name}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-400 md:text-xs">
                      Harga terakhir diperbarui
                    </p>
                  </div>

                  <p className="text-base font-black text-orange-500 md:text-xl">
                    {store.formattedPrice}
                  </p>

                  <a
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="rounded-xl bg-orange-500 px-5 py-3 text-center text-xs font-bold text-white md:text-sm"
                  >
                    Kunjungi Toko
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Harga marketplace belum tersedia.
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-2 md:px-5 md:pb-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 text-[10px] text-slate-500 md:p-5 md:text-sm">
          <p>
            Brand:{" "}
            <span className="font-semibold text-slate-800">{brandName}</span>
          </p>
          <p className="mt-1">
            Kategori:{" "}
            <span className="font-semibold text-slate-800">
              {categoryName}
            </span>
          </p>
        </div>
      </section>

      <section className="px-4 py-6 md:px-5 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-sm font-black md:text-2xl">
              Produk Alternatif
            </h2>
            <a
              href="#"
              className="text-[10px] font-semibold text-orange-500 md:text-sm"
            >
              Lihat semua →
            </a>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-5">
            {alternatives.map((item) => (
              <article
                key={item.name}
                className="rounded-xl border border-slate-200 bg-white p-2 md:rounded-2xl md:p-4"
              >
                <div className="flex h-20 items-center justify-center rounded-lg bg-slate-100 text-[8px] text-slate-400 md:h-40 md:text-xs">
                  FOTO
                </div>
                <h3 className="mt-2 text-[9px] font-bold md:text-sm">
                  {item.name}
                </h3>
                <p className="mt-1 text-[9px] font-black text-green-600 md:text-base">
                  {item.score}
                </p>
                <p className="mt-1 text-[9px] font-black text-orange-500 md:text-base">
                  {item.price}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
              index === 3 ? "text-orange-500" : "text-slate-500"
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
