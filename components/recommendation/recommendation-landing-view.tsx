import Link from "next/link";

import RecommendationProductGrid from "@/components/recommendation/recommendation-product-grid";
import { SITE_URL } from "@/lib/site-config";
import {
  getAllRecommendationPages,
  type RecommendationLandingData,
} from "@/lib/recommendations";

const CURRENT_YEAR = new Date().getFullYear();

type RecommendationLandingViewProps = {
  data: RecommendationLandingData;
};

function formatBudget(minPrice?: number, maxPrice?: number) {
  if (minPrice === undefined && maxPrice === undefined) {
    return null;
  }

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  if (minPrice !== undefined && maxPrice !== undefined) {
    return `${formatter.format(minPrice)} – ${formatter.format(maxPrice)}`;
  }

  if (minPrice !== undefined) {
    return `Mulai ${formatter.format(minPrice)}`;
  }

  return `Maksimal ${formatter.format(maxPrice ?? 0)}`;
}

export default function RecommendationLandingView({
  data,
}: RecommendationLandingViewProps) {
  const { recommendation, categoryData } = data;
  const { category, products, total, page, pageSize, totalPages } = categoryData;
  const canonicalPath = `/rekomendasi/${recommendation.slug}`;
  const absoluteUrl = `${SITE_URL}${canonicalPath}`;
  const budget = formatBudget(
    recommendation.minPrice,
    recommendation.maxPrice,
  );
  const relatedPages = getAllRecommendationPages()
    .filter((item) => item.slug !== recommendation.slug)
    .filter(
      (item) =>
        item.categorySlug === recommendation.categorySlug ||
        recommendation.slug === "hp-terbaik",
    )
    .slice(0, 4);
  const firstItemPosition = (page - 1) * pageSize;
  const rangeStart = total === 0 ? 0 : firstItemPosition + 1;
  const rangeEnd = Math.min(firstItemPosition + products.length, total);

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
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

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
            <Link href="/kategori" className="hover:text-slate-950">
              Kategori
            </Link>
            <Link href="/rekomendasi" className="font-bold text-orange-500">
              Rekomendasi
            </Link>
            <Link href="/compare" className="hover:text-slate-950">
              Perbandingan
            </Link>
            <Link href="/articles" className="hover:text-slate-950">
              Artikel
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

      <section className="border-b border-slate-100 bg-slate-50 px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-orange-500">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/rekomendasi" className="hover:text-orange-500">
              Rekomendasi
            </Link>
            <span>/</span>
            <span className="text-slate-600">{recommendation.title}</span>
          </nav>

          <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                {recommendation.eyebrow}
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
                {recommendation.title} {CURRENT_YEAR}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                {recommendation.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/kategori/${category.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
                >
                  Kategori: {category.name}
                </Link>
                {budget && (
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700">
                    Budget: {budget}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Produk sesuai
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {total.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                Ranking BelanjaLab
              </p>
              <h2 className="mt-1 text-xl font-black md:text-2xl">
                Pilihan {recommendation.relatedLabel}
              </h2>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                {total > 0
                  ? `Menampilkan ${rangeStart}-${rangeEnd} dari ${total.toLocaleString("id-ID")} produk, diurutkan berdasarkan skor tertinggi.`
                  : "Belum ada produk published yang sesuai dengan kriteria halaman ini."}
              </p>
            </div>

            <Link
              href={`/kategori/${category.slug}`}
              className="text-xs font-black text-orange-500 hover:text-orange-600 md:text-sm"
            >
              Lihat semua {category.name}
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

      <section className="bg-slate-50 px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
              Panduan pilihan
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Cara memilih {recommendation.relatedLabel} yang tepat
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              {recommendation.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
              Dasar rekomendasi
            </p>
            <h2 className="mt-2 text-2xl font-black">Yang kami pertimbangkan</h2>
            <ol className="mt-6 space-y-5">
              {recommendation.criteria.map((criterion, index) => (
                <li key={criterion} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-orange-300">
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
        <section className="px-4 py-10 md:px-6 md:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Lanjutkan eksplorasi
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Rekomendasi terkait
                </h2>
              </div>
              <Link
                href="/rekomendasi"
                className="text-xs font-black text-orange-500 hover:text-orange-600 md:text-sm"
              >
                Lihat semua
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPages.map((item) => (
                <Link
                  key={item.slug}
                  href={`/rekomendasi/${item.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-500">
                    {item.eyebrow}
                  </p>
                  <p className="mt-2 text-base font-black text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
