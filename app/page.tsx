import type { Metadata } from "next";
import CategoryVisual from "@/components/home/category-visual";
import DecisionProductCard from "@/components/home/decision-product-card";
import {
  ArrowRightIcon,
  CompareIcon,
  RefreshIcon,
  ScoreIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/home/home-icons";
import QuickComparison from "@/components/home/quick-comparison";
import ScoreMethodology from "@/components/home/score-methodology";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getHomepageArticles } from "@/lib/articles";
import {
  getHomepageCategories,
  type CategoryIconKey,
} from "@/lib/categories";
import { getActiveSiteFooter } from "@/lib/footer";
import { getActiveHero } from "@/lib/hero";
import {
  getFeaturedProducts,
  type FeaturedProduct,
} from "@/lib/products";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

function getCategoryVisualKey(slug: string): CategoryIconKey {
  if (slug === "rumah-tangga") return "rumah";
  return slug;
}

function formatArticleDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Artikel BelanjaLab";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function Home() {
  const [products, hero, categories, articles, footer] = await Promise.all([
    getFeaturedProducts(),
    getActiveHero(),
    getHomepageCategories(),
    getHomepageArticles(),
    getActiveSiteFooter(),
  ]);

  const heroProduct = hero?.featured_product;
  const heroProductImage =
    hero?.hero_image_url ??
    products[0]?.imageUrl ??
    "/images/products/product-placeholder.svg";
  const heroProductName =
    heroProduct?.name ?? products[0]?.name ?? "Produk pilihan BelanjaLab";

  const quickComparisonProducts =
    products.length >= 2
      ? ([products[0], products[1]] as [FeaturedProduct, FeaturedProduct])
      : null;

  return (
    <main className="min-h-screen bg-[#f8f8f7] pb-20 text-slate-900 md:pb-0">
      <a
        href="#konten-utama"
        className="sr-only z-[100] rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lewati ke konten utama
      </a>

      <SiteHeader active="home" />

      <div id="konten-utama">
        <section
          id="kategori"
          aria-labelledby="kategori-title"
          className="border-b border-slate-200 bg-white px-4 py-5 md:px-5 md:py-7"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Mulai dari kebutuhanmu
                </p>
                <h1
                  id="kategori-title"
                  className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl"
                >
                  Jelajahi Kategori
                </h1>
              </div>

              <a
                href="/kategori"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Lihat semua <ArrowRightIcon />
              </a>
            </div>

            {categories.length > 0 ? (
              <div className="category-rail -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-6">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/kategori/${category.slug}`}
                    className="category-card public-card group flex min-w-[132px] flex-col items-center rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md md:min-w-0"
                  >
                    <span className="category-visual-shell relative flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
                      <CategoryVisual
                        icon={getCategoryVisualKey(category.slug)}
                        className="h-12 w-12"
                      />
                    </span>
                    <span className="mt-2.5 line-clamp-2 text-sm font-semibold leading-5 text-slate-800 group-hover:text-slate-950">
                      {category.name}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                Kategori akan tampil setelah data tersedia.
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-6 md:px-5 md:py-10">
          <div className="hero-surface relative mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-slate-200 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
            <div className="relative z-10 flex flex-col justify-center p-5 sm:p-8 lg:p-11">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Shopping Decision Platform
              </p>

              <h2 className="brand-text-balance mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.08]">
                {hero?.title ?? "Pilih produk dengan alasan yang lebih jelas."}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                {hero?.subtitle ??
                  "Bandingkan skor, fitur, dan harga dari beberapa marketplace sebelum menentukan pilihan."}
              </p>

              <form
                action="/search"
                method="get"
                className="mt-6 flex max-w-2xl items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
              >
                <SearchIcon className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  name="q"
                  required
                  aria-label="Cari produk"
                  placeholder="Cari produk, kategori, atau merek"
                  className="min-h-11 min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Cari
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {["HP Samsung", "Gaming", "Elektronik", "Rumah Tangga"].map(
                  (keyword) => (
                    <a
                      key={keyword}
                      href={`/search?q=${encodeURIComponent(keyword)}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white/80 px-3 text-xs font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                    >
                      {keyword}
                    </a>
                  ),
                )}
              </div>

              {(hero?.primary_button_text || hero?.secondary_button_text) && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {hero?.primary_button_text && hero?.primary_button_url && (
                    <a
                      href={hero.primary_button_url}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      {hero.primary_button_text}
                    </a>
                  )}
                  {hero?.secondary_button_text && hero?.secondary_button_url && (
                    <a
                      href={hero.secondary_button_url}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {hero.secondary_button_text}
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white/70 p-5 sm:p-8 lg:border-l lg:border-t-0">
              <article className="hero-product-card flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.11em] text-amber-700">
                      Pilihan untuk dianalisis
                    </p>
                    <p className="mt-1 line-clamp-2 text-base font-semibold text-slate-950 sm:text-lg">
                      {heroProductName}
                    </p>
                  </div>
                  <span className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-emerald-50 px-3 text-xs font-semibold text-emerald-800">
                    Data transparan
                  </span>
                </div>

                <div className="mt-4 flex min-h-56 flex-1 items-center justify-center rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100 sm:min-h-64">
                  <img
                    src={heroProductImage}
                    alt={heroProductName}
                    className="max-h-64 w-full object-contain"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm leading-6 text-slate-500">
                    {heroProduct?.short_description ??
                      products[0]?.shortDescription ??
                      "Lihat skor, harga, dan detail analisis sebelum membeli."}
                  </p>

                  {heroProduct?.slug ? (
                    <a
                      href={`/product/${heroProduct.slug}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Lihat analisis <ArrowRightIcon />
                    </a>
                  ) : products[0] ? (
                    <a
                      href={`/product/${products[0].slug}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Lihat analisis <ArrowRightIcon />
                    </a>
                  ) : null}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 md:px-5 md:pb-12">
          <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3">
            {[
              {
                title: "BelanjaLab Score",
                description: "Lima aspek utama diringkas dalam skor yang mudah dibandingkan.",
                icon: ScoreIcon,
              },
              {
                title: "Harga dari beberapa sumber",
                description: "Lihat harga mulai dan kapan datanya terakhir diperbarui.",
                icon: RefreshIcon,
              },
              {
                title: "Analisis transparan",
                description: "Bandingkan alasan, bukan hanya popularitas atau harga termurah.",
                icon: ShieldCheckIcon,
              },
            ].map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="public-card flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="produk" className="scroll-mt-28 px-4 py-8 md:px-5 md:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-700">
                  Pilihan berdasarkan data
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  Produk yang layak dipertimbangkan
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Mulai dari skor, kekuatan utama, harga, sampai kesegaran data.
                </p>
              </div>

              <a
                href="/rekomendasi"
                className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
              >
                Lihat rekomendasi <ArrowRightIcon />
              </a>
            </div>

            {products.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
                {products.map((product) => (
                  <DecisionProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-7 text-center">
                <p className="text-base font-semibold text-slate-900">
                  Belum ada produk pilihan.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Produk published dan featured akan tampil di bagian ini.
                </p>
              </div>
            )}
          </div>
        </section>

        {quickComparisonProducts && (
          <section className="px-4 py-8 md:px-5 md:py-12">
            <div className="mx-auto max-w-7xl">
              <QuickComparison products={quickComparisonProducts} />
            </div>
          </section>
        )}

        <section id="metodologi" className="scroll-mt-28 px-4 py-8 md:px-5 md:py-12">
          <div className="mx-auto max-w-7xl">
            <ScoreMethodology />
          </div>
        </section>

        <section className="px-4 py-8 md:px-5 md:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-700">
                  Panduan belanja
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  Artikel terbaru
                </h2>
              </div>
              <a
                href="/articles"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
              >
                Semua artikel <ArrowRightIcon />
              </a>
            </div>

            {articles.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {articles.map((article) => (
                  <a
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="public-card group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                      <img
                        src={
                          article.imageUrl ??
                          "/images/products/product-placeholder.svg"
                        }
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                        <span>{formatArticleDate(article.publishedAt)}</span>
                        <span>{article.readingTime}</span>
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-slate-950">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-7 text-center">
                <p className="text-base font-semibold text-slate-900">
                  Artikel sedang disiapkan.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Panduan terbaru akan muncul setelah artikel dipublikasikan.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-8 md:px-5 md:py-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                Masih ragu?
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">
                Bandingkan pilihanmu sebelum membeli.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Lihat perbedaan skor, harga, dan spesifikasi dalam satu tampilan.
              </p>
            </div>
            <a
              href="/compare"
              className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <CompareIcon className="h-4 w-4" />
              Mulai bandingkan
            </a>
          </div>
        </section>
      </div>

      <SiteFooter footer={footer} />
      <MobileBottomNav active="home" />
    </main>
  );
}
