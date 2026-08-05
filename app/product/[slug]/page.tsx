import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CompareIcon,
  RefreshIcon,
  ScoreIcon,
  StoreIcon,
} from "@/components/home/home-icons";
import Breadcrumbs from "@/components/site/breadcrumbs";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getActiveSiteFooter } from "@/lib/footer";
import { getMarketplaceOffersByProductSlug } from "@/lib/marketplace-prices";
import { getProductBySlug, getSingleRelation } from "@/lib/products";
import {
  PRODUCT_PLACEHOLDER_PATH,
  SITE_URL,
  toAbsoluteSiteUrl,
} from "@/lib/site-config";
import MarketplaceOffers from "./marketplace-offers";

export const revalidate = 3600;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const category = getSingleRelation(product.categories)?.name ?? "Produk";
  const description =
    product.short_description ??
    product.description ??
    `Lihat ulasan, skor, spesifikasi, dan perbandingan harga ${product.name} di BelanjaLab.`;
  const canonicalPath = `/product/${product.slug}`;
  const imageUrl = toAbsoluteSiteUrl(product.image_url);

  return {
    title: product.name,
    description,
    keywords: [
      product.name,
      `review ${product.name}`,
      `harga ${product.name}`,
      category,
      "BelanjaLab",
    ],
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonicalPath,
      siteName: "BelanjaLab",
      title: product.name,
      description,
      images: [{ url: imageUrl, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [imageUrl],
    },
  };
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getLowestPrice(
  prices: Array<{ price: number | string | null }> | null | undefined,
) {
  const numericPrices = (prices ?? [])
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  return numericPrices.length > 0 ? Math.min(...numericPrices) : null;
}

function getScoreLabel(score: number) {
  if (score >= 9) return "Istimewa";
  if (score >= 8) return "Sangat Baik";
  if (score >= 7) return "Baik";
  if (score >= 6) return "Cukup";
  return "Perlu Dipertimbangkan";
}

function getLatestPriceCheck(
  prices:
    | Array<{ last_checked_at?: string | null; updated_at?: string | null }>
    | null
    | undefined,
) {
  const dates = (prices ?? [])
    .map((price) => price.last_checked_at ?? price.updated_at)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length === 0) return "Waktu cek belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dates[0]);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, marketplaceData, footer] = await Promise.all([
    getProductBySlug(slug),
    getMarketplaceOffersByProductSlug(slug),
    getActiveSiteFooter(),
  ]);

  if (!product) notFound();

  const category = getSingleRelation(product.categories)?.name ?? "Produk";
  const brand = getSingleRelation(product.brands)?.name ?? "Tanpa merek";
  const score = getSingleRelation(product.product_scores);

  const overallScore = Number(score?.overall_score ?? 0);
  const performanceScore = Number(score?.performance ?? 0);
  const designScore = Number(score?.design ?? 0);
  const featuresScore = Number(score?.features ?? 0);
  const valueScore = Number(score?.value ?? 0);
  const easeOfUseScore = Number(score?.ease_of_use ?? 0);
  const lowestPrice = getLowestPrice(product.product_prices);
  const sourceCount = product.product_prices?.length ?? 0;
  const latestPriceCheck = getLatestPriceCheck(product.product_prices);

  const scoreItems = [
    ["Performa", performanceScore],
    ["Desain", designScore],
    ["Fitur", featuresScore],
    ["Value", valueScore],
    ["Kemudahan", easeOfUseScore],
  ] as const;

  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const productImage = toAbsoluteSiteUrl(product.image_url);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.short_description ??
      product.description ??
      `Informasi dan perbandingan harga ${product.name}.`,
    image: [productImage],
    url: productUrl,
    brand: { "@type": "Brand", name: brand },
    category,
    ...(lowestPrice !== null
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "IDR",
            lowPrice: lowestPrice,
            offerCount: product.product_prices?.length ?? 1,
            availability: "https://schema.org/InStock",
            url: productUrl,
          },
        }
      : {}),
  };

  return (
    <>
      <SiteHeader />
      <main id="konten-utama" className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />

        <Breadcrumbs
          items={[
            { label: "Beranda", href: "/" },
            { label: category, href: `/search?q=${encodeURIComponent(category)}` },
            { label: product.name },
          ]}
        />

        <section className="px-4 py-8 md:px-5 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
            <div className="public-card flex aspect-square items-center justify-center overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7 sm:p-10 md:rounded-[2rem] md:p-14">
              <img
                src={product.image_url ?? PRODUCT_PLACEHOLDER_PATH}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/search?q=${encodeURIComponent(category)}`}
                  className="inline-flex min-h-9 items-center rounded-full bg-orange-50 px-3 text-xs font-extrabold text-orange-800 ring-1 ring-orange-100"
                >
                  {category}
                </Link>
                <span className="inline-flex min-h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-extrabold text-slate-700">
                  {brand}
                </span>
              </div>

              <h1 className="brand-text-balance mt-5 text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-4xl md:text-5xl">
                {product.name}
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                {product.short_description ?? "Ringkasan produk belum tersedia."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
                    Harga mulai
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-slate-950 sm:text-xl">
                    {lowestPrice !== null ? formatRupiah(lowestPrice) : "Belum tersedia"}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <StoreIcon className="h-3.5 w-3.5" />
                    {sourceCount > 0 ? `${sourceCount} sumber harga` : "Belum ada sumber"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-emerald-800">
                    <ScoreIcon className="h-3.5 w-3.5" /> BelanjaLab Score
                  </p>
                  <div className="mt-2 flex items-end gap-1.5">
                    <p className="text-2xl font-extrabold text-emerald-800 sm:text-3xl">
                      {overallScore > 0 ? overallScore.toFixed(1) : "—"}
                    </p>
                    {overallScore > 0 && (
                      <span className="pb-1 text-xs font-bold text-emerald-800">/10</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-bold text-emerald-800">
                    {overallScore > 0 ? getScoreLabel(overallScore) : "Belum dinilai"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600">
                <RefreshIcon className="h-4 w-4 text-slate-500" />
                Harga terakhir dicek: {latestPriceCheck}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#harga-marketplace"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-extrabold text-white transition hover:bg-orange-800"
                >
                  Bandingkan harga <ArrowRightIcon />
                </a>
                <Link
                  href={`/compare?products=${encodeURIComponent(product.slug)}`}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                >
                  <CompareIcon className="h-5 w-5" /> Tambah ke compare
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-10 md:px-5 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                Tentang produk
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                Ringkasan BelanjaLab
              </h2>
              <div className="public-card mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-7">
                <p className="text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  {product.description ??
                    product.short_description ??
                    "Deskripsi lengkap produk belum tersedia."}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                Penilaian
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                Rincian skor
              </h2>
              <div className="public-card mt-5 space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-7">
                {scoreItems.map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-slate-700">{label}</span>
                      <span className="text-sm font-extrabold text-slate-950">
                        {value > 0 ? `${value.toFixed(1)}/10` : "—"}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-orange-700"
                        style={{ width: `${Math.min(Math.max(value * 10, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="harga-marketplace" className="scroll-mt-24 px-4 py-10 md:px-5 md:py-14">
          <div className="mx-auto max-w-7xl">
            <MarketplaceOffers offers={marketplaceData?.offers ?? []} />
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-10 text-white md:px-5 md:py-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-400">
                Belanja lebih yakin
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
                Bandingkan dengan produk lain.
              </h2>
            </div>
            <Link
              href={`/compare?products=${encodeURIComponent(product.slug)}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-extrabold text-white hover:bg-orange-500"
            >
              Buka perbandingan <ArrowRightIcon />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter footer={footer} />
      <MobileBottomNav />
    </>
  );
}
