import Link from "next/link";

import CategoryVisual from "@/components/home/category-visual";
import { ArrowRightIcon, ScoreIcon } from "@/components/home/home-icons";
import RecommendationProductGrid from "@/components/recommendation/recommendation-product-grid";
import Breadcrumbs from "@/components/site/breadcrumbs";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import type { SiteFooter as SiteFooterData } from "@/lib/footer";
import {
  getAllRecommendationPages,
  type RecommendationLandingData,
} from "@/lib/recommendations";
import { SITE_URL } from "@/lib/site-config";

const CURRENT_YEAR = new Date().getFullYear();

type RecommendationLandingViewProps = {
  data: RecommendationLandingData;
  footer: SiteFooterData;
};

function formatBudget(minPrice?: number, maxPrice?: number) {
  if (minPrice === undefined && maxPrice === undefined) return null;

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  if (minPrice !== undefined && maxPrice !== undefined) {
    return `${formatter.format(minPrice)} – ${formatter.format(maxPrice)}`;
  }

  if (minPrice !== undefined) return `Mulai ${formatter.format(minPrice)}`;
  return `Maksimal ${formatter.format(maxPrice ?? 0)}`;
}

export default function RecommendationLandingView({
  data,
  footer,
}: RecommendationLandingViewProps) {
  const { recommendation, categoryData } = data;
  const { category, products, total, page, pageSize, totalPages } = categoryData;
  const canonicalPath = `/rekomendasi/${recommendation.slug}`;
  const absoluteUrl = `${SITE_URL}${canonicalPath}`;
  const budget = formatBudget(recommendation.minPrice, recommendation.maxPrice);
  const relatedPages = getAllRecommendationPages()
    .filter((item) => item.slug !== recommendation.slug)
    .filter(
      (item) =>
        item.categorySlug === recommendation.categorySlug ||
        recommendation.slug === "hp-terbaik",
    )
    .slice(0, 4);
  const firstItemPosition = (page - 1) * pageSize;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${recommendation.title} ${CURRENT_YEAR}`,
        description: recommendation.description,
        url: absoluteUrl,
        inLanguage: "id-ID",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Rekomendasi",
            item: `${SITE_URL}/rekomendasi`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: recommendation.title,
            item: absoluteUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `${recommendation.title} ${CURRENT_YEAR}`,
        numberOfItems: total,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: firstItemPosition + index + 1,
          name: product.name,
          url: `${SITE_URL}/product/${product.slug}`,
        })),
      },
    ],
  };

  return (
    <>
      <SiteHeader active="recommendations" />

      <main
        id="konten-utama"
        className="min-h-screen bg-[#f6f6f6] pb-20 text-slate-900 md:pb-0"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />

        <Breadcrumbs
          items={[
            { label: "Beranda", href: "/" },
            { label: "Rekomendasi", href: "/rekomendasi" },
            { label: recommendation.title },
          ]}
        />

        <section className="px-4 pb-5 pt-5 md:px-5 md:pb-7 md:pt-7">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 md:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <span
                aria-hidden="true"
                className="category-visual-shell relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-amber-50 to-orange-100 ring-1 ring-amber-100 sm:h-24 sm:w-24"
              >
                <CategoryVisual
                  icon={category.icon}
                  className="h-[4.5rem] w-[4.5rem] sm:h-[5.25rem] sm:w-[5.25rem]"
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-700">
                  {recommendation.eyebrow}
                </p>
                <h1 className="brand-text-balance mt-1.5 max-w-4xl text-2xl font-bold leading-[1.15] tracking-[-0.035em] text-slate-950 sm:text-3xl md:text-4xl">
                  {recommendation.title} {CURRENT_YEAR}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                  {recommendation.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/kategori/${category.slug}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  >
                    {category.name}
                  </Link>
                  {budget && (
                    <span className="inline-flex min-h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-800">
                      {budget}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-11 pt-2 md:px-5 md:pb-14 md:pt-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Ranking BelanjaLab
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                  Pilihan {recommendation.relatedLabel}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Diurutkan berdasarkan skor tertinggi dan kriteria halaman ini.
                </p>
              </div>

              <Link
                href={`/kategori/${category.slug}`}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800"
              >
                Lihat kategori <ArrowRightIcon />
              </Link>
            </div>

            <RecommendationProductGrid
              products={products}
              basePath={canonicalPath}
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              label={recommendation.title}
            />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-10 md:px-5 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                Panduan pilihan
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                Cara memilih {recommendation.relatedLabel} yang tepat
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {recommendation.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <aside className="rounded-2xl bg-slate-950 p-6 text-white sm:p-7 md:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                <ScoreIcon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
                Dasar rekomendasi
              </p>
              <h2 className="mt-2 text-2xl font-bold">Yang kami pertimbangkan</h2>
              <ol className="mt-6 space-y-5">
                {recommendation.criteria.map((criterion, index) => (
                  <li key={criterion} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-amber-300">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-6 text-slate-300">
                      {criterion}
                    </p>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        {relatedPages.length > 0 && (
          <section className="px-4 py-10 md:px-5 md:py-14">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Lanjutkan eksplorasi
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                    Rekomendasi terkait
                  </h2>
                </div>
                <Link
                  href="/rekomendasi"
                  className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800"
                >
                  Lihat semua <ArrowRightIcon />
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPages.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/rekomendasi/${item.slug}`}
                    className="public-card group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">
                      {item.eyebrow}
                    </p>
                    <p className="mt-2 text-base font-bold text-slate-950 transition group-hover:text-amber-800">
                      {item.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter footer={footer} />
      <MobileBottomNav />
    </>
  );
}
