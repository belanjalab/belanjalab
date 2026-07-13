const categories = [
  { name: "Gadget", icon: "📱" },
  { name: "Elektronik", icon: "💻" },
  { name: "Rumah Tangga", icon: "🏠" },
  { name: "Gaming", icon: "🎮" },
  { name: "Kesehatan", icon: "🧴" },
  { name: "Fashion", icon: "👕" },
  { name: "Ibu & Bayi", icon: "🍼" },
  { name: "Olahraga", icon: "🏸" },
];

const products = [
  {
    badge: "TERLARIS",
    badgeColor: "bg-green-500",
    name: "Logitech G102 Lightsync",
    category: "Mouse Gaming",
    price: "Rp249.000",
    oldPrice: "Rp279.000",
  },
  {
    badge: "PROMO",
    badgeColor: "bg-amber-500",
    name: "Xiaomi Air Fryer 4.5L",
    category: "Peralatan Rumah",
    price: "Rp899.000",
    oldPrice: "Rp1.099.000",
  },
  {
    badge: "PROMO",
    badgeColor: "bg-orange-500",
    name: "iPhone 15 128GB",
    category: "Smartphone",
    price: "Rp12.999.000",
    oldPrice: "Rp13.499.000",
  },
  {
    badge: "BEST DEAL",
    badgeColor: "bg-orange-500",
    name: "Asus VivoBook 14",
    category: "Laptop",
    price: "Rp8.499.000",
    oldPrice: "Rp8.999.000",
  },
  {
    badge: "REKOMENDASI",
    badgeColor: "bg-orange-500",
    name: "Samsung Galaxy A55",
    category: "Smartphone",
    price: "Rp6.199.000",
    oldPrice: "Rp6.499.000",
  },
];

const articles = [
  {
    title: "10 Laptop Terbaik untuk Mahasiswa",
    category: "Panduan Belanja",
  },
  {
    title: "Air Fryer vs Oven Listrik",
    category: "Perbandingan",
  },
  {
    title: "7 Headset Gaming Terbaik",
    category: "Rekomendasi",
  },
  {
    title: "iPhone 15 vs Samsung S24",
    category: "Perbandingan",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">
          <a href="#" className="shrink-0 text-xl font-black tracking-tight">
            Belanja<span className="text-orange-500">Lab</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="#kategori" className="hover:text-slate-950">
              Kategori
            </a>
            <a href="#perbandingan" className="hover:text-slate-950">
              Perbandingan
            </a>
            <a href="#artikel" className="hover:text-slate-950">
              Artikel
            </a>
            <a href="#tentang" className="hover:text-slate-950">
              Tentang Kami
            </a>
          </nav>

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
      <section className="px-5 py-8 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-3xl bg-slate-50 px-6 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-12 md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-orange-500">
              Keputusan belanja
            </p>

            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              Keputusan Belanja yang Lebih Cerdas.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              Review jujur, perbandingan lengkap, dan rekomendasi terpercaya
              untuk membantu kamu memilih produk terbaik.
            </p>

            <div className="mt-8 flex max-w-xl items-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <input
                type="text"
                placeholder="Cari produk, kategori, atau brand..."
                className="min-w-0 flex-1 px-3 text-sm outline-none"
              />
              <button
                type="button"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Cari
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>Contoh:</span>
              {["Air Fryer", "Laptop", "Headset Gaming", "Xiaomi"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative min-h-72">
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
      <section className="px-5">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["✓", "Review Jujur", "Berdasarkan riset dan pengalaman"],
            ["✓", "Detail & Skor", "Skor objektif untuk setiap produk"],
            ["✓", "Perbandingan Mudah", "Bandingkan hingga 3 produk"],
            ["✓", "Harga Terpercaya", "Informasi harga yang relevan"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="kategori" className="px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black">Kategori Populer</h2>
              <p className="mt-1 text-sm text-slate-500">
                Jelajahi kategori produk paling sering dicari.
              </p>
            </div>
            <a href="#" className="text-sm font-semibold text-orange-500">
              Lihat semua →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <a
                key={category.name}
                href="#"
                className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-3xl">{category.icon}</div>
                <p className="mt-3 text-xs font-semibold">{category.name}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black">Produk Trending</h2>
              <p className="mt-1 text-sm text-slate-500">
                Produk yang sedang banyak dicari dan layak dipertimbangkan.
              </p>
            </div>
            <a href="#" className="text-sm font-semibold text-orange-500">
              Lihat semua →
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {products.map((product) => (
              <article
                key={product.name}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-3">
                  <span
                    className={`${product.badgeColor} rounded-full px-2.5 py-1 text-[10px] font-bold text-white`}
                  >
                    {product.badge}
                  </span>

                  <div className="mt-3 flex h-44 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-400">
                    FOTO PRODUK
                  </div>
                </div>

                <div className="p-4 pt-1">
                  <p className="text-xs text-slate-400">{product.category}</p>
                  <h3 className="mt-1 min-h-10 text-sm font-bold leading-5">
                    {product.name}
                  </h3>
                  <p className="mt-3 text-base font-black text-orange-500">
                    {product.price}
                  </p>
                  <p className="text-xs text-slate-400 line-through">
                    {product.oldPrice}
                  </p>

                  <button className="mt-4 w-full rounded-lg bg-orange-500 py-2.5 text-xs font-bold text-white hover:bg-orange-600">
                    Lihat Produk
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="perbandingan" className="px-5 pb-16">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-50 p-6 md:p-10">
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
      <section id="artikel" className="px-5 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black">Artikel Terbaru</h2>
              <p className="mt-1 text-sm text-slate-500">
                Panduan singkat untuk membantu keputusan belanja.
              </p>
            </div>
            <a href="#" className="text-sm font-semibold text-orange-500">
              Lihat semua →
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((article) => (
              <article
                key={article.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex h-40 items-center justify-center bg-slate-100 text-xs font-semibold text-slate-400">
                  GAMBAR
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400">{article.category}</p>
                  <h3 className="mt-2 text-sm font-bold leading-6">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-xs text-slate-400">5 menit baca</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="tentang" className="bg-slate-950 px-5 py-12 text-white">
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
    </main>
  );
}
