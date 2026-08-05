import type { Metadata } from "next";
import { getHomepageArticles } from "@/lib/articles";
import { getHomepageCategories } from "@/lib/categories";
import { getActiveSiteFooter } from "@/lib/footer";
import { getActiveHero } from "@/lib/hero";
import { getFeaturedProducts } from "@/lib/products";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

type IconProps = {
  className?: string;
};

function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function CategoryIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CompareIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h13" />
      <path d="m17 4 3 3-3 3" />
      <path d="M17 17H4" />
      <path d="m7 14-3 3 3 3" />
    </svg>
  );
}

function ArticleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
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

  const mobileNavigation = [
    { label: "Beranda", href: "/", icon: HomeIcon },
    { label: "Kategori", href: "#kategori", icon: CategoryIcon },
    { label: "Cari", href: "/search", icon: SearchIcon },
    { label: "Compare", href: "/compare", icon: CompareIcon },
    { label: "Artikel", href: "#artikel", icon: ArticleIcon },
  ];

  return (
    <>
      <a
        href="#konten-utama"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center px-3 py-2 sm:px-4 md:px-5 md:py-3">
          <details className="group relative mr-1 lg:hidden">
            <summary className="mobile-menu-summary flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100">
              <MenuIcon />
              <span className="sr-only">Buka menu utama</span>
            </summary>

            <nav
              aria-label="Menu utama"
              className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <a
                href="#kategori"
                className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                Kategori
              </a>
              <a
                href="/compare"
                className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                Perbandingan
              </a>
              <a
                href="/articles"
                className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                Artikel
              </a>
              <a
                href="#tentang"
                className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                Tentang Kami
              </a>
            </nav>
          </details>

          <a
            href="/"
            aria-label="BelanjaLab, kembali ke beranda"
            className="flex min-h-11 items-center gap-2 rounded-lg"
          >
            <img
              src="/images/logo-belanjalab.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />
            <span className="text-base font-black tracking-tight md:text-xl">
              Belanja<span className="text-orange-700">Lab</span>
            </span>
          </a>

          <nav
            aria-label="Navigasi utama"
            className="ml-6 hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex xl:ml-8 xl:gap-6"
          >
            <a
              href="#kategori"
              className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-slate-950"
            >
              Kategori
            </a>
            <a
              href="/compare"
              className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-slate-950"
            >
              Perbandingan
            </a>
            <a
              href="/articles"
              className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-slate-950"
            >
              Artikel
            </a>
            <a
              href="#tentang"
              className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-slate-950"
            >
              Tentang Kami
            </a>
          </nav>

          <a
            href="/search"
            aria-label="Buka pencarian"
            className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          >
            <SearchIcon />
          </a>

          <form
            action="/search"
            method="get"
            role="search"
            className="ml-auto hidden max-w-sm flex-1 items-center rounded-xl border border-slate-300 bg-slate-50 p-1 transition focus-within:border-orange-700 focus-within:ring-2 focus-within:ring-orange-100 md:flex lg:max-w-xs xl:max-w-sm"
          >
            <label htmlFor="header-search" className="sr-only">
              Cari produk, kategori, atau merek
            </label>
            <input
              id="header-search"
              type="search"
              name="q"
              required
              autoComplete="off"
              placeholder="Cari produk, kategori, atau merek..."
              className="min-h-11 min-w-0 w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Cari"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-orange-700 text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
            >
              <SearchIcon className="h-[18px] w-[18px]" />
            </button>
          </form>
        </div>
      </header>

      <main id="konten-utama" className="min-h-screen bg-white text-slate-900">
        <section className="px-4 py-8 sm:py-10 md:px-5 md:py-12">
          <div className="mx-auto max-w-7xl md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] md:gap-8 md:overflow-hidden md:rounded-3xl md:bg-slate-50 md:px-8 md:py-12 lg:gap-10 lg:px-12 lg:py-16">
            <div className="flex min-w-0 flex-col justify-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-700 md:mb-4 md:tracking-[0.22em]">
                Keputusan belanja
              </p>

              <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl md:text-5xl lg:text-6xl">
                {hero?.title ?? "Bandingkan produk. Pilih dengan yakin."}
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-6 text-slate-600 sm:text-base md:mt-5 md:text-lg md:leading-7">
                {hero?.subtitle ??
                  "Review jujur, perbandingan lengkap, dan rekomendasi terpercaya untuk membantu kamu memilih produk terbaik."}
              </p>

              <form
                action="/search"
                method="get"
                role="search"
                className="mt-6 flex items-center rounded-2xl border border-slate-300 bg-white p-1.5 shadow-sm transition focus-within:border-orange-700 focus-within:ring-2 focus-within:ring-orange-100 md:mt-8 md:max-w-xl"
              >
                <label htmlFor="hero-search" className="sr-only">
                  Cari produk, kategori, atau merek
                </label>
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
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
                >
                  <SearchIcon className="h-[18px] w-[18px]" />
                  <span>Cari</span>
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600 md:mt-5">
                <span className="mr-1">Contoh:</span>
                {["Air Fryer", "Laptop", "Headset", "Xiaomi"].map((item) => (
                  <a
                    key={item}
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
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
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
                    >
                      {hero.primary_button_text}
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

              <div className="mt-7 flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 md:hidden">
                <img
                  src={heroProductImage}
                  alt={heroProductName}
                  className="h-full w-full object-contain p-6"
                />
              </div>
            </div>

            <div className="relative hidden min-h-[25rem] md:block">
              <div className="absolute inset-y-0 right-0 w-full rounded-3xl bg-white p-5 shadow-xl lg:w-[88%] lg:p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                  Produk Pilihan
                </p>
                <h2 className="mt-2 text-lg font-bold leading-6 text-slate-950">
                  {heroProductName}
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {heroProduct?.short_description ??
                    products[0]?.category ??
                    "Rekomendasi produk terbaik"}
                </p>

                <div className="mt-5 flex h-52 items-center justify-center rounded-2xl bg-slate-100 lg:h-56">
                  <img
                    src={heroProductImage}
                    alt={heroProductName}
                    className="h-full w-full object-contain p-5"
                  />
                </div>

                {heroProduct?.slug && (
                  <a
                    href={`/product/${heroProduct.slug}`}
                    className="mt-4 inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-orange-700 transition-colors hover:text-orange-800"
                  >
                    Lihat analisis <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>

              <div
                aria-hidden="true"
                className="absolute left-0 top-10 hidden rounded-2xl bg-white p-5 text-3xl shadow-xl xl:block"
              >
                🎧
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-3 right-0 hidden rounded-2xl bg-white p-5 text-3xl shadow-xl xl:block"
              >
                📱
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Keunggulan BelanjaLab" className="px-4 md:px-5">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:gap-3 md:grid-cols-4 md:p-5">
            {[
              ["Review Jujur", "Riset dan pengalaman"],
              ["BelanjaLab Score", "Skor objektif"],
              ["Perbandingan", "Bandingkan produk"],
              ["Harga Update", "Informasi tetap relevan"],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-2.5 rounded-xl p-2 sm:p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-700 md:h-9 md:w-9">
                  <CheckIcon />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-bold leading-5 text-slate-900 sm:text-sm">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    {desc}
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
              <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Kategori Populer
              </h2>
              <a
                href="/search"
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-1 text-sm font-bold text-orange-700 transition-colors hover:text-orange-800"
              >
                Lihat semua <span aria-hidden="true">→</span>
              </a>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/search?q=${encodeURIComponent(category.name)}`}
                    className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <span aria-hidden="true" className="text-3xl">
                      {category.icon}
                    </span>
                    <span className="mt-3 text-[13px] font-bold leading-5 text-slate-800 sm:text-sm">
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
              <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Produk Pilihan
              </h2>
              <a
                href="/search"
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-1 text-sm font-bold text-orange-700 transition-colors hover:text-orange-800"
              >
                Lihat semua <span aria-hidden="true">→</span>
              </a>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="p-2.5 md:p-3">
                      <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100 sm:h-40 md:h-48">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-3 pt-1 md:p-4 md:pt-1">
                      <p className="text-xs font-medium leading-5 text-slate-600">
                        {product.category}
                      </p>
                      <h3 className="mt-1 min-h-11 text-sm font-bold leading-[1.35] text-slate-950 sm:text-[15px] md:text-base">
                        {product.name}
                      </h3>
                      <p className="mt-3 text-xs font-bold leading-5 text-green-700 sm:text-[13px]">
                        Score {product.score}
                      </p>
                      <p className="mt-1 text-sm font-black leading-5 text-orange-700 sm:text-base">
                        {product.price}
                      </p>

                      <a
                        href={`/product/${product.slug}`}
                        aria-label={`Lihat analisis ${product.name}`}
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-orange-700 px-3 text-center text-[13px] font-bold text-white transition-colors hover:bg-orange-800 active:bg-orange-900 sm:text-sm"
                      >
                        Lihat analisis
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
          <div className="mx-auto max-w-7xl rounded-3xl bg-slate-50 p-5 sm:p-7 lg:p-10">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
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
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-700 text-sm font-black text-white shadow-sm">
                        VS
                      </div>
                    )}
                    <article className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:block sm:p-5 md:p-6">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:h-28 sm:w-full">
                        <img
                          src={product.imageUrl}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-contain p-2.5 sm:p-4"
                        />
                      </div>
                      <div className="min-w-0 sm:mt-4">
                        <p className="text-xs font-medium text-slate-600">
                          {product.category}
                        </p>
                        <h3 className="mt-1 text-sm font-bold leading-5 text-slate-950 sm:text-base">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-sm font-black text-green-700 sm:text-xl">
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
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
            >
              Bandingkan sekarang <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section
          id="artikel"
          className="scroll-mt-24 px-4 pb-10 md:px-5 md:pb-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
              <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Artikel Terbaru
              </h2>
              <a
                href="/articles"
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-1 text-sm font-bold text-orange-700 transition-colors hover:text-orange-800"
              >
                Lihat semua <span aria-hidden="true">→</span>
              </a>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-3 md:grid md:grid-cols-3 md:gap-5 md:space-y-0">
                {articles.map((article) => (
                  <a
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="flex min-h-32 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md md:block"
                  >
                    <div className="flex w-28 shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-xs font-semibold text-slate-600 sm:w-36 md:h-44 md:w-full">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "Gambar artikel"
                      )}
                    </div>

                    <div className="min-w-0 p-4 md:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Artikel
                      </p>
                      <h3 className="mt-1.5 text-sm font-bold leading-5 text-slate-950 sm:text-[15px] md:mt-2 md:text-base md:leading-6">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-600 md:text-sm">
                          {article.excerpt}
                        </p>
                      )}

                      <p className="mt-2 text-xs font-medium text-slate-600 md:mt-3">
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
              className="inline-flex min-h-11 items-center gap-3 rounded-lg"
            >
              <img
                src="/images/logo-belanjalab.png"
                alt=""
                aria-hidden="true"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-xl font-black">
                Belanja<span className="text-orange-500">Lab</span>
              </span>
            </a>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              {footer.companyDescription}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Produk</h3>
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
            <h3 className="text-sm font-bold text-white">Perusahaan</h3>
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
            <h3 className="text-sm font-bold text-white">Legal</h3>
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
