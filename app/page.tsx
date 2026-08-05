import type { Metadata } from "next";
import { getHomepageArticles } from "@/lib/articles";
import { getHomepageCategories } from "@/lib/categories";
import { getActiveSiteFooter } from "@/lib/footer";
import { getActiveHero } from "@/lib/hero";
import { getFeaturedProducts } from "@/lib/products";
import {
  ArrowRightIcon,
  ArticleIcon,
  CategoryGlyph,
  CategoryIcon,
  CompareIcon,
  HeadphonesIcon,
  HomeIcon,
  InfoIcon,
  MenuIcon,
  RefreshIcon,
  ScoreIcon,
  SearchIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
} from "@/components/home/home-icons";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default async function Home() {
  const [products, hero, categories, articles, footer] = await Promise.all([
    getFeaturedProducts(),
    getActiveHero(),
    getHomepageCategories(),
    getHomepageArticles(),
    getActiveSiteFooter(),
  ]);

  const heroProduct = hero?.featured_product;
  const heroCardProduct =
    products.find((product) => product.id === heroProduct?.id) ?? products[0];
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
  const heroPriceLabel = heroProductPrice.startsWith("Rp")
    ? "Harga mulai"
    : "Informasi harga";

  const companyLinks = [
    { label: "Kontak", href: footer.contactUrl },
    { label: "Karier", href: footer.careersUrl },
  ].filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  );
  const legalLinks = [
    { label: "Kebijakan Privasi", href: footer.privacyUrl },
    { label: "Syarat Penggunaan", href: footer.termsUrl },
    { label: "Disclaimer", href: footer.disclaimerUrl },
  ].filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  );

  const drawerNavigation = [
    { label: "Kategori", href: "#kategori", icon: CategoryIcon },
    { label: "Perbandingan", href: "/compare", icon: CompareIcon },
    { label: "Artikel", href: "/articles", icon: ArticleIcon },
    { label: "Tentang Kami", href: "#tentang", icon: InfoIcon },
  ];

  const mobileNavigation = [
    { label: "Beranda", href: "/", icon: HomeIcon },
    { label: "Kategori", href: "#kategori", icon: CategoryIcon },
    { label: "Cari", href: "/search", icon: SearchIcon },
    { label: "Compare", href: "/compare", icon: CompareIcon },
    { label: "Artikel", href: "#artikel", icon: ArticleIcon },
  ];

  const trustItems = [
    {
      title: "Review Jujur",
      description: "Riset, bukan sekadar promosi",
      icon: ShieldCheckIcon,
    },
    {
      title: "BelanjaLab Score",
      description: "Kualitas diringkas jadi satu skor",
      icon: ScoreIcon,
    },
    {
      title: "Perbandingan",
      description: "Lihat beda yang benar-benar penting",
      icon: CompareIcon,
    },
    {
      title: "Harga Diperbarui",
      description: "Cek harga dari sumber tersedia",
      icon: RefreshIcon,
    },
  ];

  return (
    <>
      <a
        href="#konten-utama"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center px-3 py-2 sm:px-4 md:px-5 md:py-2.5">
          <details className="group relative mr-1 lg:hidden">
            <summary className="mobile-menu-summary flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100">
              <MenuIcon />
              <span className="sr-only">Buka menu utama</span>
            </summary>

            <nav
              aria-label="Menu utama"
              className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10"
            >
              {drawerNavigation.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                </a>
              ))}
            </nav>
          </details>

          <a
            href="/"
            aria-label="BelanjaLab, kembali ke beranda"
            className="flex min-h-11 items-center gap-2 rounded-xl"
          >
            <img
              src="/images/logo-belanjalab.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />
            <span className="text-base font-extrabold tracking-[-0.035em] text-slate-950 md:text-xl">
              Belanja<span className="text-orange-700">Lab</span>
            </span>
          </a>

          <nav
            aria-label="Navigasi utama"
            className="ml-7 hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex xl:ml-10"
          >
            <a
              href="#kategori"
              className="inline-flex min-h-11 items-center rounded-xl px-3 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Kategori
            </a>
            <a
              href="/compare"
              className="inline-flex min-h-11 items-center rounded-xl px-3 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Perbandingan
            </a>
            <a
              href="/articles"
              className="inline-flex min-h-11 items-center rounded-xl px-3 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Artikel
            </a>
            <a
              href="#tentang"
              className="inline-flex min-h-11 items-center rounded-xl px-3 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Tentang Kami
            </a>
          </nav>

          <a
            href="/search"
            aria-label="Buka pencarian produk"
            className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          >
            <SearchIcon />
          </a>

          <a
            href="/search"
            className="ml-auto hidden min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 md:inline-flex"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
            Cari produk
          </a>
        </div>
      </header>

      <main id="konten-utama" className="min-h-screen bg-white text-slate-900">
        <section className="px-4 py-6 sm:py-8 md:px-5 md:py-10">
          <div className="hero-surface relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-orange-100 px-5 py-7 sm:px-7 sm:py-9 md:grid md:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] md:gap-10 md:rounded-[2rem] md:px-10 md:py-12 lg:gap-14 lg:px-14 lg:py-16">
            <div className="relative z-10 flex min-w-0 flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-orange-800 shadow-sm backdrop-blur">
                <SparklesIcon className="h-4 w-4" />
                Shopping Decision Platform
              </div>

              <h1 className="brand-text-balance mt-5 max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-[-0.045em] text-slate-950 sm:text-5xl md:text-5xl lg:text-[4rem] lg:leading-[1.02]">
                {hero?.title ?? "Bandingkan lebih cepat. Pilih tanpa ragu."}
              </h1>

              <p className="mt-5 max-w-2xl text-[15px] leading-6 text-slate-600 sm:text-base md:text-lg md:leading-8">
                {hero?.subtitle ??
                  "Review jujur, perbandingan yang mudah dipahami, dan rekomendasi untuk membantu kamu membeli produk yang benar-benar sesuai."}
              </p>

              <ol
                aria-label="Cara menggunakan BelanjaLab"
                className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-700 sm:text-sm"
              >
                {["Cari produk", "Bandingkan pilihan", "Putuskan dengan yakin"].map(
                  (step, index) => (
                    <li key={step} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-extrabold text-white">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ),
                )}
              </ol>

              <form
                action="/search"
                method="get"
                role="search"
                className="mt-6 flex items-center rounded-2xl border border-slate-300 bg-white p-1.5 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.55)] transition focus-within:border-orange-700 focus-within:ring-4 focus-within:ring-orange-100 md:mt-8 md:max-w-xl"
              >
                <label htmlFor="hero-search" className="sr-only">
                  Cari produk, kategori, atau merek
                </label>
                <span
                  aria-hidden="true"
                  className="ml-2 hidden text-slate-500 sm:inline-flex"
                >
                  <SearchIcon className="h-5 w-5" />
                </span>
                <input
                  id="hero-search"
                  type="search"
                  name="q"
                  required
                  autoComplete="off"
                  placeholder="Cari produk, kategori, atau merek..."
                  className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none sm:text-base"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-extrabold text-white transition-colors hover:bg-orange-800 active:bg-orange-900 sm:px-5"
                >
                  <span>Cari</span>
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="mr-1 font-medium">Pencarian populer:</span>
                {["Air Fryer", "Laptop", "Headset", "Xiaomi"].map((item) => (
                  <a
                    key={item}
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white/80 px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                  >
                    {item}
                  </a>
                ))}
              </div>

              {(hero?.primary_button_text || hero?.secondary_button_text) && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {hero?.primary_button_text && hero?.primary_button_url && (
                    <a
                      href={hero.primary_button_url}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-extrabold text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
                    >
                      {hero.primary_button_text}
                      <ArrowRightIcon />
                    </a>
                  )}

                  {hero?.secondary_button_text &&
                    hero?.secondary_button_url && (
                      <a
                        href={hero.secondary_button_url}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        {hero.secondary_button_text}
                      </a>
                    )}
                </div>
              )}
            </div>

            <div className="relative z-10 mt-8 flex items-center justify-center md:mt-0">
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-full bg-orange-300/30 blur-3xl"
              />

              <article className="hero-product-card relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-4 backdrop-blur sm:p-5 lg:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-700">
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
                  </div>
                </div>

                <div className="mt-4 flex h-48 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100 sm:h-56 lg:h-64">
                  <img
                    src={heroProductImage}
                    alt={heroProductName}
                    className="h-full w-full object-contain p-5 sm:p-6"
                  />
                </div>

                <h2 className="brand-text-balance mt-5 text-lg font-extrabold leading-6 tracking-[-0.025em] text-slate-950 sm:text-xl sm:leading-7">
                  {heroProductName}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {heroProduct?.short_description ??
                    "Pilihan yang layak dipertimbangkan berdasarkan data yang tersedia."}
                </p>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {heroPriceLabel}
                    </p>
                    <p className="mt-1 text-base font-extrabold text-slate-950">
                      {heroProductPrice}
                    </p>
                  </div>

                  {heroProductSlug && (
                    <a
                      href={`/product/${heroProductSlug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white transition-colors hover:bg-slate-800"
                    >
                      Lihat analisis
                      <ArrowRightIcon />
                    </a>
                  )}
                </div>
              </article>

              <div
                aria-hidden="true"
                className="absolute -left-4 top-12 hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white text-orange-700 shadow-xl shadow-slate-950/10 xl:flex"
              >
                <HeadphonesIcon className="h-7 w-7" />
              </div>
              <div
                aria-hidden="true"
                className="absolute -right-3 bottom-12 hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white text-orange-700 shadow-xl shadow-slate-950/10 xl:flex"
              >
                <SmartphoneIcon className="h-7 w-7" />
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Keunggulan BelanjaLab" className="px-4 md:px-5">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-3 md:grid-cols-4 md:p-4">
            {trustItems.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 sm:p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700 ring-1 ring-orange-100">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-extrabold leading-5 text-slate-900 sm:text-sm">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="kategori"
          className="scroll-mt-24 px-4 py-10 md:px-5 md:py-14"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                  Jelajahi
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  Kategori Populer
                </h2>
              </div>
              <a
                href="/search"
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-sm font-extrabold text-orange-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
              >
                Lihat semua <ArrowRightIcon />
              </a>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-4">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/search?q=${encodeURIComponent(category.name)}`}
                    className="group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:min-h-32 sm:p-4"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-orange-50 group-hover:text-orange-700 sm:h-12 sm:w-12"
                    >
                      <CategoryGlyph icon={category.icon} />
                    </span>
                    <span className="mt-3 text-xs font-extrabold leading-5 text-slate-800 sm:text-sm">
                      {category.name}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">
                  Kategori pilihan sedang kami siapkan.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Coba gunakan pencarian untuk menemukan produk yang kamu butuhkan.
                </p>
              </div>
            )}
          </div>
        </section>

        <section
          id="produk"
          className="scroll-mt-24 px-4 pb-10 md:px-5 md:pb-16"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                  Rekomendasi
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  Produk Pilihan
                </h2>
              </div>
              <a
                href="/search"
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-sm font-extrabold text-orange-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
              >
                Lihat semua <ArrowRightIcon />
              </a>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/5 md:rounded-3xl"
                  >
                    <div className="p-2.5 md:p-3">
                      <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100 sm:h-40 md:h-48 md:rounded-2xl">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-3 pt-1 md:p-4 md:pt-1">
                      <p className="text-xs font-semibold leading-5 text-slate-500">
                        {product.category}
                      </p>
                      <h3 className="mt-1 min-h-11 text-sm font-extrabold leading-[1.35] tracking-[-0.015em] text-slate-950 sm:text-[15px] md:text-base">
                        {product.name}
                      </h3>

                      <div className="mt-3">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-800 ring-1 ring-emerald-100">
                          Score {product.score}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-extrabold leading-5 text-slate-950 sm:text-base">
                        {product.price}
                      </p>

                      <a
                        href={`/product/${product.slug}`}
                        aria-label={`Lihat analisis ${product.name}`}
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-3 text-center text-[13px] font-extrabold text-white transition-colors hover:bg-orange-800 active:bg-orange-900 sm:text-sm"
                      >
                        Lihat analisis <ArrowRightIcon />
                      </a>
                    </div>
                  </article>
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

        <section
          id="perbandingan"
          className="scroll-mt-24 px-4 pb-10 md:px-5 md:pb-16"
        >
          <div className="compare-surface mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-slate-200 p-5 sm:p-7 lg:p-10">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                Pilih dengan data
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                Perbandingan Unggulan
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                Lihat perbedaan produk populer dalam satu tampilan sebelum menentukan pilihan.
              </p>
            </div>

            {products.length >= 2 ? (
              <div className="mt-6 grid items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center md:gap-5">
                {products.slice(0, 2).map((product, index) => (
                  <div key={product.id} className="contents">
                    {index === 1 && (
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-extrabold text-white shadow-lg shadow-slate-950/15">
                        VS
                      </div>
                    )}
                    <article className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:block sm:p-5 md:p-6">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100 sm:h-28 sm:w-full">
                        <img
                          src={product.imageUrl}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-contain p-2.5 sm:p-4"
                        />
                      </div>
                      <div className="min-w-0 sm:mt-4">
                        <p className="text-xs font-semibold text-slate-500">
                          {product.category}
                        </p>
                        <h3 className="mt-1 text-sm font-extrabold leading-5 text-slate-950 sm:text-base">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-sm font-extrabold text-emerald-800 sm:text-xl">
                          {product.score}
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
                          {product.price}
                        </p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                Pilih dua produk untuk melihat perbedaan score, harga, dan spesifikasinya.
              </div>
            )}

            <a
              href="/compare"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-extrabold text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
            >
              Bandingkan sekarang <ArrowRightIcon />
            </a>
          </div>
        </section>

        <section
          id="artikel"
          className="scroll-mt-24 px-4 pb-10 md:px-5 md:pb-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                  Panduan praktis
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  Artikel Terbaru
                </h2>
              </div>
              <a
                href="/articles"
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-sm font-extrabold text-orange-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
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
                      <p className="text-xs font-extrabold uppercase tracking-wide text-orange-700">
                        Artikel
                      </p>
                      <h3 className="mt-1.5 text-sm font-extrabold leading-5 tracking-[-0.01em] text-slate-950 sm:text-[15px] md:mt-2 md:text-base md:leading-6">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-600 md:text-sm">
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

      <footer
        id="tentang"
        className="scroll-mt-24 bg-slate-950 px-4 py-10 pb-[calc(7rem+env(safe-area-inset-bottom))] text-white md:px-5 md:py-12 md:pb-12"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4 md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <a
              href="/"
              aria-label="BelanjaLab, kembali ke beranda"
              className="inline-flex min-h-11 items-center gap-3 rounded-xl"
            >
              <img
                src="/images/logo-belanjalab.png"
                alt=""
                aria-hidden="true"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-xl font-extrabold tracking-[-0.035em]">
                Belanja<span className="text-orange-500">Lab</span>
              </span>
            </a>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              {footer.companyDescription}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">Produk</h3>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <a
                href="#produk"
                className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
              >
                Rekomendasi
              </a>
              <a
                href="/compare"
                className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
              >
                Perbandingan
              </a>
              <a
                href="#kategori"
                className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
              >
                Kategori
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">Perusahaan</h3>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <a
                href="#tentang"
                className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
              >
                Tentang Kami
              </a>
              {companyLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-extrabold text-white">Legal</h3>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              {legalLinks.length > 0 ? (
                legalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ))
              ) : (
                <p className="py-2 leading-6">Informasi legal segera tersedia.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-xs leading-5 text-slate-400">
          © {new Date().getFullYear()} BelanjaLab. All rights reserved.
        </div>
      </footer>

      <nav
        aria-label="Navigasi utama mobile"
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
      >
        {mobileNavigation.map(({ label, href, icon: Icon }, index) => (
          <a
            key={label}
            href={href}
            aria-current={index === 0 ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-semibold transition-colors ${
              index === 0
                ? "text-orange-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
