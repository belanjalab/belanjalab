import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { getMarketplaceOffersByProductSlug } from "@/lib/marketplace-prices";
import MarketplaceOffers from "./marketplace-offers";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getLowestPrice(
  prices:
    | Array<{
        price: number | string | null;
      }>
    | null
    | undefined,
) {
  const numericPrices = (prices ?? [])
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));

  return numericPrices.length > 0 ? Math.min(...numericPrices) : null;
}

function getScoreLabel(score: number) {
  if (score >= 9) return "Istimewa";
  if (score >= 8) return "Sangat Baik";
  if (score >= 7) return "Baik";
  if (score >= 6) return "Cukup";
  return "Perlu Dipertimbangkan";
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const [product, marketplaceData] = await Promise.all([
    getProductBySlug(slug),
    getMarketplaceOffersByProductSlug(slug),
  ]);

  if (!product) {
    notFound();
  }

  const category = product.categories?.[0]?.name ?? "Produk";
  const brand = product.brands?.[0]?.name ?? "Tanpa merek";
  const score = product.product_scores?.[0];

  const overallScore = Number(score?.overall_score ?? 0);
  const performanceScore = Number(score?.performance ?? 0);
  const designScore = Number(score?.design ?? 0);
  const featuresScore = Number(score?.features ?? 0);
  const valueScore = Number(score?.value ?? 0);
  const easeOfUseScore = Number(score?.ease_of_use ?? 0);

  const lowestPrice = getLowestPrice(product.product_prices);

  const scoreItems = [
    ["Performa", performanceScore],
    ["Desain", designScore],
    ["Fitur", featuresScore],
    ["Value", valueScore],
    ["Kemudahan", easeOfUseScore],
  ] as const;

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />

            <span className="text-base font-black md:text-xl">
              Belanja<span className="text-orange-500">Lab</span>
            </span>
          </Link>

          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <Link href="/#kategori" className="hover:text-slate-950">
              Kategori
            </Link>
            <Link href="/compare" className="hover:text-slate-950">
              Perbandingan
            </Link>
            <Link href="/search" className="hover:text-slate-950">
              Cari
            </Link>
          </nav>

          <Link
            href="/search"
            className="ml-auto rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500 md:px-4 md:text-sm"
          >
            Cari Produk
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-100 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden text-[10px] text-slate-400 md:text-xs">
          <Link href="/" className="shrink-0 hover:text-orange-500">
            Beranda
          </Link>
          <span>/</span>
          <span className="shrink-0">{category}</span>
          <span>/</span>
          <span className="truncate font-semibold text-slate-600">
            {product.name}
          </span>
        </div>
      </section>

      <section className="px-4 py-7 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-slate-100 p-8 md:p-14">
              <img
                src={
                  product.image_url ??
                  "/images/products/logitech-g102.png"
                }
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-600 md:text-xs">
                {category}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 md:text-xs">
                {brand}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
              {product.short_description ??
                "Ringkasan produk belum tersedia."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Harga mulai
                </p>
                <p className="mt-2 text-xl font-black text-orange-500 md:text-2xl">
                  {lowestPrice !== null
                    ? formatRupiah(lowestPrice)
                    : "Belum tersedia"}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
                  BelanjaLab Score
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="text-2xl font-black text-green-600 md:text-3xl">
                    {overallScore > 0
                      ? overallScore.toFixed(1)
                      : "—"}
                  </p>

                  {overallScore > 0 && (
                    <span className="pb-1 text-xs font-bold text-green-700">
                      /10
                    </span>
                  )}
                </div>

                {overallScore > 0 && (
                  <p className="mt-1 text-[10px] font-bold text-green-700">
                    {getScoreLabel(overallScore)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#harga-marketplace"
                className="flex-1 rounded-xl bg-orange-500 px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-orange-600"
              >
                Bandingkan Harga
              </a>

              <Link
                href="/compare"
                className="flex-1 rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-bold text-slate-700 hover:border-orange-300 hover:text-orange-500"
              >
                Tambah ke Compare
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Tentang Produk
            </p>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              Ringkasan BelanjaLab
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <p className="text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                {product.description ??
                  product.short_description ??
                  "Deskripsi lengkap produk belum tersedia."}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Penilaian
            </p>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              Rincian Skor
            </h2>

            <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              {scoreItems.map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-700">
                      {label}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {value > 0 ? `${value.toFixed(1)}/10` : "—"}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{
                        width: `${Math.min(Math.max(value * 10, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="harga-marketplace"
        className="scroll-mt-24 px-4 py-8 md:px-6 md:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <MarketplaceOffers
            offers={marketplaceData?.offers ?? []}
          />
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-8 text-white md:px-6 md:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
              Belanja lebih yakin
            </p>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              Bandingkan dengan produk lain.
            </h2>
          </div>

          <Link
            href="/compare"
            className="rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-bold text-white hover:bg-orange-600"
          >
            Buka Perbandingan
          </Link>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {[
          ["⌂", "Beranda", "/"],
          ["▦", "Kategori", "/#kategori"],
          ["⌕", "Cari", "/search"],
          ["⇄", "Compare", "/compare"],
          ["▤", "Artikel", "/#artikel"],
        ].map(([icon, label, href]) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1 text-[9px] text-slate-500"
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
