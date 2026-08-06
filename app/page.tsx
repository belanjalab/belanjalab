import type { Metadata } from "next";
import { getHomepageArticles } from "@/lib/articles";
import { getHomepageCategories } from "@/lib/categories";
import { getActiveSiteFooter } from "@/lib/footer";
import { getActiveHero } from "@/lib/hero";
import {
  getFeaturedProducts,
  type FeaturedProduct,
} from "@/lib/products";
import CategoryVisual from "@/components/home/category-visual";
import DecisionProductCard from "@/components/home/decision-product-card";
import QuickComparison from "@/components/home/quick-comparison";
import ScoreMethodology from "@/components/home/score-methodology";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import {
  ArrowRightIcon,
  ArticleIcon,
  CompareIcon,
  RefreshIcon,
  ScoreIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StoreIcon,
} from "@/components/home/home-icons";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

function findQuickComparisonPair(
  products: FeaturedProduct[],
): [FeaturedProduct, FeaturedProduct] | null {
  for (let firstIndex = 0; firstIndex < products.length; firstIndex += 1) {
    const firstProduct = products[firstIndex];
    const secondProduct = products
      .slice(firstIndex + 1)
      .find(
        (candidate) =>
          candidate.category.trim().toLowerCase() ===
          firstProduct.category.trim().toLowerCase(),
      );

    if (secondProduct) {
      return [firstProduct, secondProduct];
    }
  }

  return null;
}

export default async function Home() {
  const [products, hero, categories, articles, footer] = await Promise.all([
    getFeaturedProducts(),
    getActiveHero(),
    getHomepageCategories(),
    getHomepageArticles(),
    getActiveSiteFooter(),
  ]);

  const quickComparisonProducts = findQuickComparisonPair(products);
  const heroProduct = hero?.featured_product;
  const heroCardProduct = heroProduct
    ? products.find((product) => product.id === heroProduct.id)
    : products[0];
  const heroProductImage =
    hero?.hero_image_url ??
    heroCardProduct?.imageUrl ??
    "/images/products/product-placeholder.svg";
  const heroProductName =
    heroProduct?.name ?? heroCardProduct?.name ?? "Produk pilihan BelanjaLab";
  const heroProductSlug = heroProduct?.slug ?? heroCardProduct?.slug;
  const heroProductCategory = heroCardProduct?.category ?? "Produk pilihan";
  const heroProductScore = heroCardProduct?.score ?? "Belum dinilai";
  const heroProductPrice = heroCardProduct?.price ?? "Harga belum tersedia";
  const heroProductStrength = heroCardProduct?.topStrength;
  const heroProductFreshness =
    heroCardProduct?.priceFreshness ?? "Waktu cek belum tersedia";
  const heroProductSourceCount = heroCardProduct?.priceSourceCount ?? 0;
  const heroProductVerdict = heroCardProduct?.scoreVerdict ?? "Belum dinilai";
  const heroPriceLabel = heroProductPrice.startsWith("Rp")
    ? "Harga mulai"
    : "Informasi harga";

  const trustItems = [
    {
      title: "Analisis transparan",
      description: "Alasan penilaian dapat ditelusuri",
      icon: ShieldCheckIcon,
      href: "#metodologi",
    },
    {
      title: "BelanjaLab Score",
      description: "Kualitas diringkas jadi satu skor",
      icon: ScoreIcon,
      href: "#metodologi",
    },
    {
      title: "Perbandingan",
      description: "Lihat beda yang benar-benar penting",
      icon: CompareIcon,
      href: "#perbandingan",
    },
    {
      title: "Waktu Cek Harga",
      description: "Lihat kapan data terakhir dicek",
      icon: RefreshIcon,
      href: "#metodologi",
    },
  ];

  return (
    <>
      <SiteHeader active="home" />

      <main id="konten-utama" className="min-h-screen bg-[#f6f6f6] text-slate-900">
        <section
          id="kategori"
          className="scroll-mt-32 border-b border-slate-200 bg-white px-4 py-4 md:px-5 md:py-5"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  Jelajahi kategori
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-slate-950 sm:text-xl">
                  Mulai dari kebutuhanmu
                </h2>
              </div>
              <a
                href="/search"
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
              >
                Cari lainnya <ArrowRightIcon />
              </a>
            </div>

            {categories.length > 0 ? (
              <div className="category-rail -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:px-0">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/search?q=${encodeURIComponent(category.name)}`}
                    className="category-card group flex min-h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-transparent bg-white px-2 py-3 text-center transition hover:border-amber-200 hover:bg-amber-50/50 sm:w-28 md:min-h-28 md:w-auto md:px-3"
                  >
                    <span
                      aria-hidden="true"
                      className="category-visual-shell relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-amber-50 to-orange-100 shadow-sm ring-1 ring-amber-100/80 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:h-[4.5rem] sm:w-[4.5rem]"
                    >
                      <CategoryVisual icon={category.icon} className="h-14 w-14 sm:h-16 sm:w-16" />
                    </span>
                    <span className="mt-2.5 text-xs font-semibold leading-4 text-slate-700 transition-colors group-hover:text-amber-800 sm:text-sm">
                      {category.name}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-bold text-slate-700">
                  Kategori pilihan sedang kami siapkan.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Gunakan pencarian untuk menemukan produk yang kamu butuhkan.
                </p>
              </div>
            )}
          </div>
        </section>

        <section
          id="produk"
          className="scroll-mt-24 border-b border-slate-200 bg-[#f6f6f6] px-4 py-8 md:px-5 md:py-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  Sedang populer
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  Produk Terlaris
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Lihat produk populer beserta skor, kekuatan utama, sumber harga, dan waktu pembaruannya.
                </p>
              </div>
              <a
                href="/search"
                className="inline-flex min-h-11 w-fit shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-extrabold text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
              >
                Cari produk <ArrowRightIcon />
              </a>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <DecisionProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">
                  Rekomendasi produk baru sedang kami siapkan.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Gunakan pencarian untuk menjelajahi produk lainnya.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 pb-5 pt-4 sm:pb-7 sm:pt-5 md:px-5 md:pb-8 md:pt-6">
          <div className="hero-surface relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-amber-100 px-5 py-7 sm:px-7 sm:py-8 md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] md:gap-8 md:px-8 md:py-9 lg:gap-10 lg:px-10 lg:py-11">
            <div className="relative z-10 flex min-w-0 flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold tracking-[0.06em] text-amber-800">
                <SparklesIcon className="h-4 w-4" />
                Shopping Decision Platform
              </div>

              <h1 className="brand-text-balance mt-4 max-w-3xl text-3xl font-bold leading-[1.12] tracking-[-0.035em] text-slate-950 sm:text-4xl md:text-4xl lg:text-5xl lg:leading-[1.08]">
                {hero?.title ?? "Bandingkan lebih cepat. Pilih tanpa ragu."}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base md:leading-7">
                {hero?.subtitle ??
                  "Analisis transparan, perbandingan yang mudah dipahami, dan rekomendasi untuk membantu kamu membeli produk yang benar-benar sesuai."}
              </p>

              <ol
                aria-label="Cara menggunakan BelanjaLab"
                className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-700 sm:text-sm"
              >
                {["Cari produk", "Bandingkan pilihan", "Putuskan dengan yakin"].map(
                  (step, index) => (
                    <li key={step} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ),
                )}
              </ol>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={hero?.primary_button_url ?? "/search"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  {hero?.primary_button_text ?? "Cari produk"} <ArrowRightIcon />
                </a>
                <a
                  href={hero?.secondary_button_url ?? "/compare"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:text-amber-700"
                >
                  <CompareIcon className="h-[18px] w-[18px]" />
                  {hero?.secondary_button_text ?? "Bandingkan"}
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="mr-1 font-medium">Pencarian populer:</span>
                {["Air Fryer", "Laptop", "Headset", "Xiaomi"].map((item) => (
                  <a
                    key={item}
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  >
                    {item}
                  </a>
                ))}
              </div>

            </div>

            <div className="relative z-10 mt-8 flex items-center justify-center md:mt-0">
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-full bg-amber-200/40 blur-3xl"
              />

              <article className="hero-product-card relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 sm:max-w-md sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                      Produk Pilihan
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {heroProductCategory}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right ring-1 ring-emerald-100">
                    <p className="text-xs font-bold text-emerald-800">
                      BelanjaLab Score
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold text-emerald-800">
                      {heroProductScore}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                      {heroProductVerdict}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex h-44 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100 sm:h-52 lg:h-56">
                  <img
                    src={heroProductImage}
                    alt={heroProductName}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-contain p-5 sm:p-6"
                  />
                </div>

                <h2 className="brand-text-balance mt-4 text-base font-semibold leading-6 text-slate-950 sm:text-lg">
                  {heroProductName}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {heroProduct?.short_description ??
                    heroCardProduct?.shortDescription ??
                    "Pilihan yang layak dipertimbangkan berdasarkan data yang tersedia."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-800">
                      Kekuatan utama
                    </p>
                    <p className="mt-1 text-xs font-extrabold leading-5 text-slate-950 sm:text-sm">
                      {heroProductStrength
                        ? `${heroProductStrength.label} ${heroProductStrength.value.toFixed(1)}/10`
                        : "Rincian skor menyusul"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                      <RefreshIcon className="h-3.5 w-3.5" />
                      Status harga
                    </p>
                    <p className="mt-1 text-xs font-extrabold leading-5 text-slate-800 sm:text-sm">
                      {heroProductFreshness}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {heroPriceLabel}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {heroProductPrice}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <StoreIcon className="h-3.5 w-3.5" />
                      {heroProductSourceCount > 0
                        ? `${heroProductSourceCount} sumber harga`
                        : "Sumber harga belum tersedia"}
                    </p>
                  </div>

                  {heroProductSlug && (
                    <a
                      href={`/product/${heroProductSlug}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      Lihat analisis
                      <ArrowRightIcon />
                    </a>
                  )}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section aria-label="Keunggulan BelanjaLab" className="px-4 pb-8 md:px-5 md:pb-12">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:gap-3 md:grid-cols-4 md:p-4">
            {trustItems.map(({ title, description, icon: Icon, href }) => (
              <a
                key={title}
                href={href}
                className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 sm:p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold leading-5 text-slate-900 sm:text-sm">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    {description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section
          id="perbandingan"
          className="scroll-mt-24 px-4 pb-10 md:px-5 md:pb-16"
        >
          <div className="mx-auto max-w-7xl">
            {quickComparisonProducts ? (
              <QuickComparison products={quickComparisonProducts} />
            ) : (
              <div className="quick-compare-surface rounded-3xl border border-slate-200 p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  Bandingkan cepat
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  Perbandingan akan muncul setelah dua produk tersedia.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Kamu tetap bisa membuka halaman perbandingan dan memilih produk secara manual.
                </p>
                <a
                  href="/compare"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white transition-colors hover:bg-slate-800"
                >
                  Buka perbandingan <ArrowRightIcon />
                </a>
              </div>
            )}
          </div>
        </section>

        <section
          id="metodologi"
          className="scroll-mt-24 px-4 pb-10 md:px-5 md:pb-16"
        >
          <div className="mx-auto max-w-7xl">
            <ScoreMethodology />
          </div>
        </section>

        <section
          id="artikel"
          className="scroll-mt-24 px-4 pb-10 md:px-5 md:pb-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  Panduan praktis
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  Artikel Terbaru
                </h2>
              </div>
              <a
                href="/articles"
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-sm font-extrabold text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
              >
                Lihat semua <ArrowRightIcon />
              </a>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-3 md:grid md:grid-cols-3 md:gap-5 md:space-y-0">
                {articles.map((article) => (
                  <a
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group flex min-h-32 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/5 md:block md:rounded-3xl"
                  >
                    <div className="flex w-28 shrink-0 items-center justify-center overflow-hidden bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-100 sm:w-36 md:h-44 md:w-full">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <>
                          <ArticleIcon className="h-8 w-8" />
                          <span className="sr-only">
                            Gambar artikel belum tersedia
                          </span>
                        </>
                      )}
                    </div>

                    <div className="min-w-0 p-4 md:p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        Artikel
                      </p>
                      <h3 className="mt-1.5 text-sm font-extrabold leading-5 tracking-[-0.01em] text-slate-950 sm:text-base md:mt-2 md:text-base md:leading-6">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600 md:text-sm">
                          {article.excerpt}
                        </p>
                      )}

                      <p className="mt-2 text-xs font-semibold text-slate-500 md:mt-3">
                        {article.readingTime}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">
                  Artikel terbaru sedang kami siapkan.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Panduan belanja berikutnya akan segera hadir.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter footer={footer} />
      <MobileBottomNav active="home" />
    </>
  );
}
