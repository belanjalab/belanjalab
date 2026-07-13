const specs = [
  ["Brand", "Logitech"],
  ["Model", "G102 Lightsync"],
  ["Sensor", "Gaming-grade sensor"],
  ["DPI", "200–8.000 DPI"],
  ["Tombol", "6 tombol programmable"],
  ["Koneksi", "USB kabel"],
  ["Berat", "85 gram"],
  ["Garansi", "2 tahun"],
];

const stores = [
  {
    name: "Tokopedia",
    price: "Rp249.000",
    note: "Gratis ongkir",
  },
  {
    name: "Shopee",
    price: "Rp255.000",
    note: "Voucher tersedia",
  },
  {
    name: "Blibli",
    price: "Rp269.000",
    note: "Official store",
  },
];

const pros = [
  "Sensor responsif untuk gaming harian",
  "Desain ringan dan nyaman",
  "RGB dapat dikustomisasi",
  "Software mudah digunakan",
];

const cons = [
  "Kabel belum braided",
  "Bentuk kurang cocok untuk tangan sangat besar",
];

export default function ProductDetailPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">
          <a href="/" className="text-xl font-black tracking-tight">
            Belanja<span className="text-orange-500">Lab</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="/#kategori" className="hover:text-slate-950">
              Kategori
            </a>
            <a href="/#perbandingan" className="hover:text-slate-950">
              Perbandingan
            </a>
            <a href="/#artikel" className="hover:text-slate-950">
              Artikel
            </a>
          </nav>

          <div className="ml-auto hidden max-w-sm flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
            <input
              type="text"
              placeholder="Cari produk, kategori, atau brand..."
              className="w-full bg-transparent text-sm outline-none"
            />
            <span className="ml-3">🔍</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 py-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <a href="/" className="hover:text-orange-500">
            Beranda
          </a>
          <span>/</span>
          <a href="#" className="hover:text-orange-500">
            Gaming
          </a>
          <span>/</span>
          <span className="text-slate-600">Logitech G102 Lightsync</span>
        </div>
      </div>

      {/* Product hero */}
      <section className="px-5 pb-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Product image */}
          <div>
            <div className="relative flex min-h-[420px] items-center justify-center rounded-3xl bg-slate-100">
              <span className="absolute left-5 top-5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white">
                TERLARIS
              </span>

              <div className="text-center">
                <div className="text-8xl">🖱️</div>
                <p className="mt-5 text-sm font-semibold text-slate-400">
                  FOTO PRODUK
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <button
                  key={item}
                  className="flex aspect-square items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl hover:border-orange-500"
                >
                  🖱️
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-orange-500">
              Mouse Gaming
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Logitech G102 Lightsync
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Mouse gaming populer dengan sensor responsif, desain klasik, dan
              pencahayaan RGB yang dapat dikustomisasi.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="rounded-xl bg-green-50 px-4 py-3">
                <p className="text-xs font-semibold text-green-600">
                  Skor BelanjaLab
                </p>
                <p className="mt-1 text-3xl font-black text-green-600">
                  9.2/10
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold">⭐ 4.8 dari 5</p>
                <p className="mt-1 text-xs text-slate-400">
                  Berdasarkan 1.240 ulasan
                </p>
              </div>
            </div>

            <div className="mt-7 border-y border-slate-200 py-6">
              <p className="text-sm text-slate-500">Harga terbaik mulai dari</p>
              <p className="mt-1 text-3xl font-black text-orange-500">
                Rp249.000
              </p>
              <p className="mt-1 text-sm text-slate-400 line-through">
                Rp279.000
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#harga"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-orange-600"
              >
                Lihat Harga Terbaik
              </a>

              <a
                href="/compare"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Tambahkan ke Perbandingan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick summary */}
      <section className="bg-slate-50 px-5 py-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            ["Cocok untuk", "Gaming kasual dan produktivitas"],
            ["Kelebihan utama", "Sensor responsif dan desain ringan"],
            ["Pertimbangan", "Kabel belum braided"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                {title}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Review */}
      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <article>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              Review BelanjaLab
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Mouse gaming murah yang sulit dikalahkan
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
              <p>
                Logitech G102 Lightsync menawarkan kombinasi performa, desain,
                dan harga yang sangat menarik. Sensornya terasa responsif untuk
                penggunaan sehari-hari maupun game kompetitif ringan.
              </p>

              <p>
                Bentuknya sederhana dan cocok untuk banyak gaya grip. Bobotnya
                juga cukup ringan sehingga nyaman digunakan dalam waktu lama.
              </p>

              <p>
                Pencahayaan RGB dapat diatur melalui software Logitech G Hub.
                Untuk pengguna yang menginginkan mouse terjangkau dengan fitur
                lengkap, produk ini masih menjadi salah satu pilihan terbaik.
              </p>
            </div>
          </article>

          <aside className="rounded-3xl bg-slate-950 p-7 text-white">
            <p className="text-sm font-bold text-orange-400">
              Kesimpulan BelanjaLab
            </p>

            <p className="mt-4 text-lg font-bold leading-8">
              Sangat direkomendasikan untuk pengguna yang mencari mouse gaming
              berkualitas dengan harga di bawah Rp300 ribu.
            </p>

            <div className="mt-6 border-t border-slate-800 pt-6">
              <p className="text-xs text-slate-400">Skor akhir</p>
              <p className="mt-1 text-5xl font-black text-green-400">9.2</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Pros and cons */}
      <section className="px-5 pb-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-green-200 bg-green-50 p-7">
            <h2 className="text-xl font-black text-green-700">
              Kelebihan
            </h2>

            <div className="mt-5 space-y-4">
              {pros.map((item) => (
                <div key={item} className="flex gap-3 text-sm text-green-900">
                  <span className="font-black">✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-7">
            <h2 className="text-xl font-black text-red-700">
              Kekurangan
            </h2>

            <div className="mt-5 space-y-4">
              {cons.map((item) => (
                <div key={item} className="flex gap-3 text-sm text-red-900">
                  <span className="font-black">−</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black">Spesifikasi Produk</h2>

          <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {specs.map(([label, value], index) => (
              <div
                key={label}
                className={`grid grid-cols-[0.8fr_1.2fr] gap-4 px-5 py-4 text-sm ${
                  index !== specs.length - 1
                    ? "border-b border-slate-200"
                    : ""
                }`}
              >
                <span className="font-semibold text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store prices */}
      <section id="harga" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div>
            <h2 className="text-3xl font-black">Bandingkan Harga</h2>
            <p className="mt-2 text-sm text-slate-500">
              Pilih toko dengan harga dan penawaran terbaik.
            </p>
          </div>

          <div className="mt-7 space-y-4">
            {stores.map((store) => (
              <div
                key={store.name}
                className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <p className="text-lg font-black">{store.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{store.note}</p>
                </div>

                <div>
                  <p className="text-xl font-black text-orange-500">
                    {store.price}
                  </p>
                </div>

                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Kunjungi Toko
                </a>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            Harga dapat berubah sewaktu-waktu. BelanjaLab dapat menerima komisi
            dari pembelian melalui tautan afiliasi tanpa biaya tambahan bagi
            pengguna.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <div className="text-xl font-black">
              Belanja<span className="text-orange-500">Lab</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
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
