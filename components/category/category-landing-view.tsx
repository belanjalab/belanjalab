import Link from "next/link";

import CategoryFilterBar from "@/components/category/category-filter-bar";
import CategoryProductGrid from "@/components/category/category-product-grid";
import CategoryVisual from "@/components/home/category-visual";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/home/home-icons";
import Breadcrumbs from "@/components/site/breadcrumbs";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import type {
  CategoryLandingData,
  CategorySeoProfile,
  CategorySubcategory,
} from "@/lib/categories";
import { categoryFiltersToQuery } from "@/lib/category-navigation";
import type { SiteFooter as SiteFooterData } from "@/lib/footer";
import { getRecommendationPagesForCategory } from "@/lib/recommendations";
import { SITE_URL } from "@/lib/site-config";

const CURRENT_YEAR = new Date().getFullYear();

type CategoryLandingViewProps = {
  data: CategoryLandingData;
  profile: CategorySeoProfile;
  basePath: string;
  canonicalPath: string;
  footer: SiteFooterData;
  subcategory?: CategorySubcategory | null;
};

export default function CategoryLandingView({
  data,
  profile,
  basePath,
  canonicalPath,
  footer,
  subcategory = null,
}: CategoryLandingViewProps) {
  const {
    category,
    products,
    total,
    page,
    pageSize,
    totalPages,
    brands,
    subcategories,
    activeFilters,
  } = data;
  const absoluteUrl = `${SITE_URL}${canonicalPath}`;
  const firstItemPosition = (page - 1) * pageSize;
  const paginationQuery = categoryFiltersToQuery(activeFilters);
  const visibleSubcategories = subcategories.filter(
    (item) => item.slug !== subcategory?.slug,
  );
  const relatedRecommendations = getRecommendationPagesForCategory(
    category.slug,
  ).slice(0, 4);
  const displayTitle = subcategory?.name ?? category.name;

  const breadcrumbItems = [
    { name: "Beranda", path: "/" },
    { name: "Kategori", path: "/kategori" },
    { name: category.name, path: `/kategori/${category.slug}` },
  ];

  if (subcategory) {
    breadcrumbItems.push({ name: subcategory.name, path: canonicalPath });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${profile.titlePrefix} ${CURRENT_YEAR}`,
        description: profile.description,
        url: absoluteUrl,
        inLanguage: "id-ID",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
        })),
      },
      {
        "@type": "ItemList",
        name: subcategory
          ? `${subcategory.name} dalam kategori ${category.name}`
          : `Produk ${category.name}`,
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
      <SiteHeader active="categories" />

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
          items={breadcrumbItems.map((item, index) => ({
            label: item.name,
            href: index === breadcrumbItems.length - 1 ? undefined : item.path,
          }))}
        />

        <section className="px-4 pb-4 pt-5 md:px-5 md:pb-6 md:pt-7">
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
                  {profile.eyebrow}
                </p>
                <h1 className="brand-text-balance mt-1.5 max-w-4xl text-2xl font-bold leading-[1.15] tracking-[-0.035em] text-slate-950 sm:text-3xl md:text-4xl">
                  {profile.titlePrefix} {CURRENT_YEAR}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                  {profile.description}
                </p>
              </div>
            </div>

            {profile.popularSearches.length > 0 && (
              <div className="category-filter-scroll -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1">
                {profile.popularSearches.map((keyword) => (
                  <Link
                    key={keyword}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {visibleSubcategories.length > 0 && (
          <section className="px-4 pb-4 md:px-5 md:pb-6">
            <div className="mx-auto max-w-7xl">
              <div className="category-filter-scroll flex gap-2 overflow-x-auto pb-1">
                <Link
                  href={`/kategori/${category.slug}`}
                  className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
                    !subcategory
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-800"
                  }`}
                >
                  Semua {category.name}
                </Link>
                {visibleSubcategories.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/kategori/${category.slug}/${item.slug}`}
                    className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-4 pb-10 pt-2 md:px-5 md:pb-14 md:pt-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Pilihan BelanjaLab
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                  {subcategory ? subcategory.name : `Pilihan ${category.name}`}
                </h2>
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(displayTitle)}`}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800"
              >
                Cari lebih luas <ArrowRightIcon />
              </Link>
            </div>

            <CategoryFilterBar
              actionPath={basePath}
              brands={brands}
              brand={activeFilters.brand}
              minPrice={activeFilters.minPrice}
              maxPrice={activeFilters.maxPrice}
              sort={activeFilters.sort}
            />

            <CategoryProductGrid
              products={products}
              categoryName={displayTitle}
              basePath={basePath}
              currentPage={page}
              totalPages={totalPages}
              query={paginationQuery}
            />
          </div>
        </section>

        {relatedRecommendations.length > 0 && (
          <section className="border-y border-slate-200 bg-white px-4 py-9 md:px-5 md:py-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Rekomendasi populer
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                    Pilih berdasarkan kebutuhan
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
                {relatedRecommendations.map((item) => (
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

        <section className="px-4 py-10 md:px-5 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="public-card rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                Panduan belanja
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                Memilih {displayTitle} dengan lebih yakin
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {profile.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <aside className="rounded-2xl bg-slate-950 p-6 text-white sm:p-7 md:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
                Sebelum membeli
              </p>
              <h2 className="mt-2 text-2xl font-bold">3 hal yang perlu dicek</h2>
              <ol className="mt-6 space-y-5">
                {profile.buyingTips.map((tip, index) => (
                  <li key={tip} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-amber-300">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-6 text-slate-300">
                      {tip}
                    </p>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter footer={footer} />
      <MobileBottomNav active="categories" />
    </>
  );
}
