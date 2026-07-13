const categories = [
  { name: "Gadget", icon: "📱" },
  { name: "Elektronik", icon: "💻" },
  { name: "Rumah", icon: "🏠" },
  { name: "Gaming", icon: "🎮" },
  { name: "Beauty", icon: "🧴" },
];

const products = [
  {
    name: "Logitech G102",
    category: "Mouse Gaming",
    score: "9.2/10",
    price: "Rp249.000",
    oldPrice: "Rp279.000",
  },
  {
    name: "Xiaomi Air Fryer",
    category: "Peralatan Rumah",
    score: "9.0/10",
    price: "Rp899.000",
    oldPrice: "Rp1.099.000",
  },
  {
    name: "iPhone 15",
    category: "Smartphone",
    score: "9.5/10",
    price: "Rp12.999.000",
    oldPrice: "Rp13.499.000",
  },
];

const articles = [
  {
    title: "10 Laptop Terbaik untuk Mahasiswa",
    category: "Panduan Belanja",
    time: "6 menit baca",
  },
  {
    title: "Air Fryer vs Oven Listrik",
    category: "Perbandingan",
    time: "5 menit baca",
  },
  {
    title: "7 Headset Gaming Terbaik",
    category: "Rekomendasi",
    time: "7 menit baca",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      {/* Header */}
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

          <a
            href="#"
            className="shrink-0 text-base font-black tracking-tight md:text-xl"
          >
            Belanja<span className="text-orange-500">Lab</span>
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

          <button
            type="button"
            aria-label="Cari"
            className="ml-auto text-lg md:hidden"
          >
            ⌕
          </button>

          <div className="ml-auto hidden max-w-sm flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
            <input
              type="text"
              placeholder="Cari produk, kategori, atau brand..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              aria-label="Cari"
              className="ml-3 rounded-lg bg-orange-500 px-3 py-1.5 text-white"
            >
              🔍
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-5 md:px-5 md:py-12">
        <div className="mx-auto max-w-7xl md:grid md:grid-cols-[1.2fr_0.8fr] md:gap-10 md:overflow-hidden md:rounded-3xl md:bg-slate-50 md:px-12 md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 md:mb-4 md:text-xs md:tracking-[0.22em]">
              Keputusan belanja
            </p>

            <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              Yang Lebih Cerdas
            </h1>

            <p className="mt-3 max-w-xl text-xs leading-5 text-slate-500 md:mt-5 md:text-lg md:leading-7 md:text-slate-600">
              Review jujur, perbandingan lengkap, dan rekomendasi terpercaya
              untuk membantu kamu memilih produk terbaik.
            </p>

            <div className="mt-5 flex items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm md:mt-8 md:max-w-xl md:p-2">
              <input
                type="text"
                placeholder="Cari produk, kategori, atau brand..."
                className="min-w-0 flex-1 px-3 text-xs outline-none md:text-sm"
              />
              <button
                type="button"
                className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 md:px-4 md:text-sm"
              >
                🔍
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500 md:mt-5 md:text-xs">
              <span>Contoh:</span>
              {["Air Fryer", "Laptop", "Headset", "Xiaomi"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 md:px-3 md:py-1.5"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 flex h-52 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold text-slate-400 md:hidden">
              FOTO PRODUK HERO
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

              <h2 className="mt-1 text-lg font-bold">Visual produk utama</h2>

              <p className="mt-1 text-xs text-slate-500">
                Area ini dapat diganti dengan foto produk.
              </p>

              <div className="mt-5 flex h-44 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-400">
                FOTO PRODUK
              </div>
            </div>

            <div className="absolute bottom-2 right-0 rounded-2xl bg-white p-5 text-3xl shadow-xl">
              📱
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
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

      {/* Categories */}
      <section id="kategori" className="px-4 py-7 md:px-5 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between md:mb-6">
            <h2 className="text-sm font-black md:text-2xl">Kategori Populer</h2>
            <a
              href="#"
              className="text-[10px] font-semibold text-orange-500 md:text-sm"
            >
              Lihat semua →
            </a>
          </div>

          <div className="grid grid-cols-5 gap-2 md:grid-cols-5 md:gap-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href="#"
                className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md md:rounded-2xl md:p-5"
              >
                <div className="text-lg md:text-3xl">{category.icon}</div>
                <p className="mt-2 text-[9px] font-semibold md:mt-3 md:text-xs">
                  {category.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-4 pb-8 md:px-5 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between md:mb-6">
            <h2 className="text-sm font-black md:text-2xl">Produk Trending</h2>
            <a
              href="#"
              className="text-[10px] font-semibold text-orange-500 md:text-sm"
            >
              Lihat semua →
            </a>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-5">
            {products.map((product) => (
              <article
                key={product.name}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:rounded-2xl"
              >
                <div className="p-2 md:p-3">
                  <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100 text-[9px] font-semibold text-slate-400 md:h-44 md:rounded-xl md:text-xs">
                    FOTO
                  </div>
                </div>

                <div className="p-2 pt-0 md:p-4 md:pt-1">
                  <p className="text-[8px] text-slate-400 md:text-xs">
                    {product.category}
                  </p>
                  <h3 className="mt-1 min-h-8 text-[9px] font-bold leading-4 md:min-h-10 md:text-sm md:leading-5">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-[10px] font-black text-green-600 md:mt-3 md:text-base">
                    {product.score}
                  </p>
                  <p className="mt-1 text-[9px] font-black text-orange-500 md:text-base">
                    {product.price}
                  </p>
                  <p className="text-[8px] text-slate-400 line-through md:text-xs">
                    {product.oldPrice}
                  </p>

                  <a
                    href={
                      product.name === "Logitech G102"
                        ? "/product/logitech-g102-lightsync"
                        : "#"
                    }
                    className="mt-2 block w-full rounded-md bg-orange-500 py-1.5 text-center text-[8px] font-bold text-white hover:bg-orange-600 md:mt-4 md:rounded-lg md:py-2.5 md:text-xs"
                  >
                    Lihat
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison desktop */}
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
              <p className="text-xs text-slate-400">Logitech G102</p>
              <p className="mt-3 text-3xl font-black text-green-600">9.2/10</p>
              <p className="mt-1 text-xs text-slate-500">Rp279.000</p>
            </div>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-black text-white">
              VS
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs text-slate-400">Fantech X9</p>
              <p className="mt-3 text-3xl font-black text-green-600">8.6/10</p>
              <p className="mt-1 text-xs text-slate-500">Rp165.000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section id="artikel" className="px-4 pb-8 md:px-5 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between md:mb-6">
            <h2 className="text-sm font-black md:text-2xl">Artikel Terbaru</h2>
            <a
              href="#"
              className="text-[10px] font-semibold text-orange-500 md:text-sm"
            >
              Lihat semua →
            </a>
          </div>

          <div className="space-y-3 md:grid md:grid-cols-3 md:gap-5 md:space-y-0">
            {articles.map((article) => (
              <article
                key={article.title}
                className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block md:rounded-2xl"
              >
                <div className="flex w-24 shrink-0 items-center justify-center bg-slate-100 text-[9px] font-semibold text-slate-400 md:h-40 md:w-full md:text-xs">
                  GAMBAR
                </div>
                <div className="p-3 md:p-5">
                  <p className="text-[8px] text-slate-400 md:text-xs">
                    {article.category}
                  </p>
                  <h3 className="mt-1 text-[10px] font-bold leading-4 md:mt-2 md:text-sm md:leading-6">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-[8px] text-slate-400 md:mt-3 md:text-xs">
                    {article.time}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer desktop */}
      <footer
        id="tentang"
        className="hidden bg-slate-950 px-5 py-12 text-white md:block"
      >
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <div className="text-xl font-black">
              Belanja<span className="text-orange-500">Lab</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Membantu masyarakat Indonesia memilih produk dengan lebih cerdas.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold">Produk</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>Rekomendasi</p>
              <p>Perbandingan</p>
              <p>Kategori</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold">Perusahaan</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>Tentang Kami</p>
              <p>Kontak</p>
              <p>Karier</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold">Legal</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>Kebijakan Privasi</p>
              <p>Syarat Penggunaan</p>
              <p>Disclaimer</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} BelanjaLab. All rights reserved.
        </div>
      </footer>

      {/* Bottom navigation mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {[
          ["⌂", "Beranda", "/"],
          ["▦", "Kategori", "#kategori"],
          ["⌕", "Cari", "#"],
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
