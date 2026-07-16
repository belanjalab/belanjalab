import { getHomepageArticles } from "@/lib/articles";
import { getHomepageCategories } from "@/lib/categories";
import { getActiveHero } from "@/lib/hero";
import { getFeaturedProducts } from "@/lib/products";



export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, hero, categories, articles] = await Promise.all([
    getFeaturedProducts(),
    getActiveHero(),
    getHomepageCategories(),
    getHomepageArticles(),
  ]);

  const heroProduct = hero?.featured_product;
  const heroProductImage =
    hero?.hero_image_url ??
    products[0]?.imageUrl ??
    "/images/products/logitech-g102.png";
  const heroProductName =
    heroProduct?.name ?? products[0]?.name ?? "Produk pilihan BelanjaLab";

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 md:px-5 md:py-4">
          <details className="relative mr-3 md:hidden">
            <summary
              aria-label="Buka menu"
              className="cursor-pointer list-none text-lg"
            >
              ☰
            </summary>

            <nav className="absolute left-0 top-9 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <a
                href="#kategori"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              >
                Kategori
              </a>

              <a
                href="/compare"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              >
                Perbandingan
              </a>

              <a
                href="#artikel"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              >
                Artikel
              </a>

              <a
                href="#tentang"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              >
                Tentang Kami
              </a>
            </nav>
          </details>

          <a href="/" className="flex items-center gap-2">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />

            <span className="text-base font-black tracking-tight md:text-xl">
              Belanja<span className="text-orange-500">Lab</span>
            </span>
          </a>

          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="#kategori" className="hover:text-slate-950">
              Kategori
            </a>
            <a href="/compare" className="hover:text-slate-950">
              Perbandingan
            </a>
            <a href="#artikel" className="hover:text-slate-950">
              Artikel
            </a>
            <a href="#tentang" className="hover:text-slate-950">
              Tentang Kami
            </a>
          </nav>

          <a
            href="/search"
            aria-label="Cari"
            className="ml-auto text-lg md:hidden"
          >
            ⌕
          </a>

          <form
            action="/search"
            method="get"
            className="ml-auto hidden max-w-sm flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex"
          >
            <input
              type="search"
              name="q"
              required
              placeholder="Cari produk, kategori, atau brand..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              aria-label="Cari"
              className="ml-3 rounded-lg bg-orange-500 px-3 py-1.5 text-white"
            >
              🔍
            </button>
          </form>
        </div>
      </header>

      <section className="px-4 py-5 md:px-5 md:py-12">
        <div className="mx-auto max-w-7xl md:grid md:grid-cols-[1.2fr_0.8fr] md:gap-10 md:overflow-hidden md:rounded-3xl md:bg-slate-50 md:px-12 md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 md:mb-4 md:text-xs md:tracking-[0.22em]">
              Keputusan belanja
            </p>

            <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              {hero?.title ?? "Yang Lebih Cerdas"}
            </h1>

            <p className="mt-3 max-w-xl text-xs leading-5 text-slate-500 md:mt-5 md:text-lg md:leading-7 md:text-slate-600">
              {hero?.subtitle ??
                "Review jujur, perbandingan lengkap, dan rekomendasi terpercaya untuk membantu kamu memilih produk terbaik."}
            </p>

            <form
              action="/search"
              method="get"
              className="mt-5 flex items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm md:mt-8 md:max-w-xl md:p-2"
            >
              <input
                type="search"
                name="q"
                required
                placeholder="Cari produk, kategori, atau brand..."
                className="min-w-0 flex-1 px-3 text-xs outline-none md:text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 md:px-4 md:text-sm"
              >
                🔍
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500 md:mt-5 md:text-xs">
              <span>Contoh:</span>
              {["Air Fryer", "Laptop", "Headset", "Xiaomi"].map((item) => (
                <a
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 md:px-3 md:py-1.5"
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
                    className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-600 md:text-sm"
                  >
                    {hero.primary_button_text}
                  </a>
                )}

                {hero?.secondary_button_text && hero?.secondary_button_url && (
                  <a
                    href={hero.secondary_button_url}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 md:text-sm"
                  >
                    {hero.secondary_button_text}
                  </a>
                )}
              </div>
            )}

            <div className="mt-5 flex h-52 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold text-slate-400 md:hidden">
              <img
                src={heroProductImage}
                alt={heroProductName}
                className="h-full w-full object-contain p-6"
              />
            </div>
          </div>

          <div className="relative hidden min-h-72 md:block">
            <div className="absolute left-0 top-10 rounded-2xl bg-white p-5 shadow-xl">
              <div className="text-3xl">🎧</div>
            </div>

            <div className="absolute right-0 top-0 w-[82%] rounded-3xl bg-white p-5 shadow-xl">
              <p className="text-xs font-semibold text-orange-500">
                Produk Pilihan
              </p>

              <h2 className="mt-1 text-lg font-bold">{heroProductName}</h2>

              <p className="mt-1 text-xs text-slate-500">
                {heroProduct?.short_description ??
                  products[0]?.category ??
                  "Rekomendasi produk terbaik"}
              </p>

              <div className="mt-5 flex h-44 items-center justify-center rounded-2xl bg-slate-100">
                <img
                  src={heroProductImage}
                  alt={heroProductName}
                  className="h-full w-full object-contain p-5"
                />
              </div>

              {heroProduct?.slug && (
                <a
                  href={`/product/${heroProduct.slug}`}
                  className="mt-4 inline-flex text-xs font-bold text-orange-500 hover:text-orange-600"
                >
                  Lihat produk →
                </a>
              )}
            </div>

            <div className="absolute bottom-2 right-0 rounded-2xl bg-white p-5 text-3xl shadow-xl">
              📱
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-5">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-4 md:p-5">
          {[
            ["✓", "Review Jujur", "Riset dan pengalaman"],
            ["✓", "BelanjaLab Score", "Skor objektif"],
            ["✓", "Perbandingan", "Bandingkan produk"],
            ["✓", "Harga Update", "Selalu relevan"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="flex gap-2 rounded-xl p-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] text-orange-500 md:h-8 md:w-8">
                {icon}
              </div>
              <div>
                <h3 className="text-[10px] font-bold md:text-sm">{title}</h3>
                <p className="mt-1 text-[9px] leading-4 text-slate-500 md:text-xs md:leading-5">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="kategori" className="px-4 py-7 md:px-5 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between md:mb-6">
            <h2 className="text-sm font-black md:text-2xl">Kategori Populer</h2>
            <a
              href="/search"
              className="text-[10px] font-semibold text-orange-500 md:text-sm"
            >
              Lihat semua →
            </a>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
              {categories.map((category) => (
              <a
                key={category.id}
                href={`/search?q=${encodeURIComponent(category.name)}`}
                className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md md:rounded-2xl md:p-5"
              >
                <div className="text-lg md:text-3xl">{category.icon}</div>
                <p className="mt-2 text-[9px] font-semibold md:mt-3 md:text-xs">
                  {category.name}
                </p>
              </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada kategori.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tambahkan kategori dari dashboard admin.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="produk" className="px-4 pb-8 md:px-5 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between md:mb-6">
            <h2 className="text-sm font-black md:text-2xl">Produk Trending</h2>
            <a
              href="/search"
              className="text-[10px] font-semibold text-orange-500 md:text-sm"
            >
              Lihat semua →
            </a>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:rounded-2xl"
                >
                  <div className="p-2 md:p-3">
                    <div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 md:h-44 md:rounded-xl">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-3"
                      />
                    </div>
                  </div>

                  <div className="p-3 pt-0 md:p-4 md:pt-1">
                    <p className="text-[9px] text-slate-400 md:text-xs">
                      {product.category}
                    </p>
                    <h3 className="mt-1 min-h-10 text-[11px] font-bold leading-4 md:min-h-10 md:text-sm md:leading-5">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-[11px] font-black text-green-600 md:mt-3 md:text-base">
                      {product.score}
                    </p>
                    <p className="mt-1 text-[10px] font-black text-orange-500 md:text-base">
                      {product.price}
                    </p>

                    <a
                      href={`/product/${product.slug}`}
                      className="mt-3 block w-full rounded-md bg-orange-500 py-2 text-center text-[9px] font-bold text-white hover:bg-orange-600 md:mt-4 md:rounded-lg md:py-2.5 md:text-xs"
                    >
                      Lihat
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada produk published.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Publish produk dari dashboard admin agar tampil di sini.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="perbandingan" className="hidden px-5 pb-16 md:block">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-50 p-10">
          <div className="mb-7">
            <h2 className="text-2xl font-black">Perbandingan Unggulan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bandingkan produk populer dalam satu tampilan.
            </p>
          </div>

          <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs text-slate-400">
                {products[0]?.name ?? "Produk pertama"}
              </p>
              <p className="mt-3 text-3xl font-black text-green-600">
                {products[0]?.score ?? "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {products[0]?.price ?? "Harga belum tersedia"}
              </p>
            </div>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-black text-white">
              VS
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs text-slate-400">
                {products[1]?.name ?? "Produk kedua"}
              </p>
              <p className="mt-3 text-3xl font-black text-green-600">
                {products[1]?.score ?? "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {products[1]?.price ?? "Harga belum tersedia"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="artikel" className="px-4 pb-8 md:px-5 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between md:mb-6">
            <h2 className="text-sm font-black md:text-2xl">Artikel Terbaru</h2>
            <a
              href="/articles"
              className="text-[10px] font-semibold text-orange-500 md:text-sm"
            >
              Lihat semua →
            </a>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-3 md:grid md:grid-cols-3 md:gap-5 md:space-y-0">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md md:block md:rounded-2xl"
                >
                  <div className="flex w-24 shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-[9px] font-semibold text-slate-400 md:h-40 md:w-full md:text-xs">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "GAMBAR"
                    )}
                  </div>

                  <div className="p-3 md:p-5">
                    <p className="text-[8px] text-slate-400 md:text-xs">
                      Artikel
                    </p>

                    <h3 className="mt-1 text-[10px] font-bold leading-4 md:mt-2 md:text-sm md:leading-6">
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-slate-500 md:text-xs md:leading-5">
                        {article.excerpt}
                      </p>
                    )}

                    <p className="mt-2 text-[8px] text-slate-400 md:mt-3 md:text-xs">
                      {article.readingTime}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada artikel published.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Artikel akan tampil setelah dipublikasikan dari CMS.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer
        id="tentang"
        className="hidden bg-slate-950 px-5 py-12 text-white md:block"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <a href="/" className="flex items-center gap-3">
              <img
                src="/images/logo-belanjalab.png"
                alt="BelanjaLab"
                className="h-10 w-10 rounded-full object-cover"
              />

              <span className="text-xl font-black">
                Belanja<span className="text-orange-500">Lab</span>
              </span>
            </a>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Membantu masyarakat Indonesia memilih produk dengan lebih cerdas.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold">Produk</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <a href="#produk" className="block hover:text-white">
                Rekomendasi
              </a>
              <a href="/compare" className="block hover:text-white">
                Perbandingan
              </a>
              <a href="#kategori" className="block hover:text-white">
                Kategori
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold">Perusahaan</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <a href="#tentang" className="block hover:text-white">
                Tentang Kami
              </a>
              <a href="#" className="block hover:text-white">
                Kontak
              </a>
              <a href="#" className="block hover:text-white">
                Karier
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold">Legal</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <a href="#" className="block hover:text-white">
                Kebijakan Privasi
              </a>
              <a href="#" className="block hover:text-white">
                Syarat Penggunaan
              </a>
              <a href="#" className="block hover:text-white">
                Disclaimer
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} BelanjaLab. All rights reserved.
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {[
          ["⌂", "Beranda", "/"],
          ["▦", "Kategori", "#kategori"],
          ["⌕", "Cari", "/search"],
          ["⇄", "Compare", "/compare"],
          ["▤", "Artikel", "#artikel"],
        ].map(([icon, label, href], index) => (
          <a
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 text-[9px] ${
              index === 0 ? "text-orange-500" : "text-slate-500"
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
