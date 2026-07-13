const products = [
  {
    name: "Logitech G102 Lightsync",
    category: "Mouse Gaming",
    price: "Rp249.000",
    score: "9.2",
    rating: "4.8",
    image: "🖱️",
    badge: "Pilihan Terbaik",
    badgeClass: "bg-green-500",
  },
  {
    name: "Fantech X9 Thor",
    category: "Mouse Gaming",
    price: "Rp165.000",
    score: "8.6",
    rating: "4.6",
    image: "🖱️",
    badge: "Harga Terbaik",
    badgeClass: "bg-orange-500",
  },
  {
    name: "Rexus Daxa Air IV",
    category: "Mouse Gaming",
    price: "Rp499.000",
    score: "8.9",
    rating: "4.7",
    image: "🖱️",
    badge: "Paling Ringan",
    badgeClass: "bg-blue-500",
  },
];

const comparisonRows = [
  {
    label: "Harga",
    values: ["Rp249.000", "Rp165.000", "Rp499.000"],
    highlight: 1,
  },
  {
    label: "Skor BelanjaLab",
    values: ["9.2/10", "8.6/10", "8.9/10"],
    highlight: 0,
  },
  {
    label: "Sensor",
    values: [
      "Gaming-grade sensor",
      "PixArt optical sensor",
      "PixArt PAW3370",
    ],
  },
  {
    label: "DPI Maksimal",
    values: ["8.000 DPI", "4.800 DPI", "19.000 DPI"],
    highlight: 2,
  },
  {
    label: "Berat",
    values: ["85 gram", "90 gram", "62 gram"],
    highlight: 2,
  },
  {
    label: "Jumlah Tombol",
    values: ["6 tombol", "7 tombol", "6 tombol"],
    highlight: 1,
  },
  {
    label: "RGB",
    values: ["Lightsync RGB", "RGB 7 mode", "RGB customizable"],
  },
  {
    label: "Koneksi",
    values: ["USB kabel", "USB kabel", "Wireless + USB"],
    highlight: 2,
  },
  {
    label: "Garansi",
    values: ["2 tahun", "1 tahun", "1 tahun"],
    highlight: 0,
  },
];

const conclusions = [
  {
    title: "Pilihan terbaik secara keseluruhan",
    product: "Logitech G102 Lightsync",
    description:
      "Pilihan paling seimbang untuk performa, kenyamanan, kualitas software, dan harga.",
    score: "9.2",
  },
  {
    title: "Pilihan paling hemat",
    product: "Fantech X9 Thor",
    description:
      "Cocok untuk pengguna dengan anggaran terbatas yang tetap membutuhkan fitur gaming lengkap.",
    score: "8.6",
  },
  {
    title: "Pilihan untuk performa tinggi",
    product: "Rexus Daxa Air IV",
    description:
      "Bobot ringan, koneksi wireless, dan sensor berperforma tinggi untuk kebutuhan kompetitif.",
    score: "8.9",
  },
];

export default function ComparePage() {
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
            <a href="/compare" className="text-orange-500">
              Perbandingan
            </a>
            <a href="/#artikel" className="hover:text-slate-950">
              Artikel
            </a>
            <a href="/#tentang" className="hover:text-slate-950">
              Tentang Kami
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
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <a href="/" className="hover:text-orange-500">
            Beranda
          </a>
          <span>/</span>
          <span className="text-slate-600">Perbandingan Produk</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-5 pb-10 pt-5">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Bandingkan sebelum membeli
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
            Temukan produk yang paling cocok untuk kebutuhanmu.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Lihat perbedaan harga, spesifikasi, kelebihan, dan skor produk dalam
            satu tampilan yang mudah dipahami.
          </p>
        </div>
      </section>

      {/* Product cards */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-7xl overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-[220px_repeat(3,1fr)] gap-4">
            <div className="flex items-end pb-6">
              <div>
                <p className="text-sm font-bold">Produk dibandingkan</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Maksimal tiga produk dalam satu perbandingan.
                </p>
              </div>
            </div>

            {products.map((product) => (
              <article
                key={product.name}
                className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span
                  className={`${product.badgeClass} inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white`}
                >
                  {product.badge}
                </span>

                <button
                  type="button"
                  aria-label={`Hapus ${product.name}`}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-400 hover:bg-slate-50"
                >
                  ×
                </button>

                <div className="mt-5 flex h-40 items-center justify-center rounded-2xl bg-slate-100 text-6xl">
                  {product.image}
                </div>

                <p className="mt-5 text-xs text-slate-400">
                  {product.category}
                </p>

                <h2 className="mt-1 min-h-12 text-base font-black leading-6">
                  {product.name}
                </h2>

                <p className="mt-4 text-2xl font-black text-orange-500">
                  {product.price}
                </p>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Skor
                    </p>
                    <p className="mt-1 text-xl font-black text-green-600">
                      {product.score}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Rating
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      ⭐ {product.rating}
                    </p>
                  </div>
                </div>

                <a
                  href={
                    product.name === "Logitech G102 Lightsync"
                      ? "/product/logitech-g102-lightsync"
                      : "#"
                  }
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Lihat Produk
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Add product */}
      <section className="px-5 pb-14">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            className="w-full rounded-2xl border-2 border-dashed border-slate-300 px-6 py-5 text-sm font-bold text-slate-500 hover:border-orange-400 hover:text-orange-500"
          >
            + Tambahkan produk lain
          </button>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-slate-50 px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <h2 className="text-3xl font-black">Perbandingan Spesifikasi</h2>
            <p className="mt-2 text-sm text-slate-500">
              Nilai terbaik pada setiap kategori ditandai secara khusus.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[220px_repeat(3,1fr)] border-b border-slate-200 bg-slate-950 text-white">
                <div className="px-5 py-5 text-sm font-bold">Spesifikasi</div>

                {products.map((product) => (
                  <div
                    key={product.name}
                    className="border-l border-slate-800 px-5 py-5 text-sm font-bold"
                  >
                    {product.name}
                  </div>
                ))}
              </div>

              {comparisonRows.map((row, rowIndex) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[220px_repeat(3,1fr)] ${
                    rowIndex !== comparisonRows.length - 1
                      ? "border-b border-slate-200"
                      : ""
                  }`}
                >
                  <div className="bg-slate-50 px-5 py-5 text-sm font-bold text-slate-600">
                    {row.label}
                  </div>

                  {row.values.map((value, index) => (
                    <div
                      key={`${row.label}-${value}`}
                      className={`border-l border-slate-200 px-5 py-5 text-sm font-semibold ${
                        row.highlight === index
                          ? "bg-green-50 text-green-700"
                          : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{value}</span>

                        {row.highlight === index && (
                          <span className="rounded-full bg-green-500 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                            Terbaik
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pros and cons */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <h2 className="text-3xl font-black">Kelebihan & Kekurangan</h2>
            <p className="mt-2 text-sm text-slate-500">
              Ringkasan singkat untuk membantu keputusan lebih cepat.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-black">
                Logitech G102 Lightsync
              </h3>

              <div className="mt-5">
                <p className="text-sm font-bold text-green-600">Kelebihan</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>✓ Sensor responsif dan stabil</p>
                  <p>✓ Software Logitech G Hub</p>
                  <p>✓ Garansi paling panjang</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-bold text-red-600">Kekurangan</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>− Kabel belum braided</p>
                  <p>− Bobot bukan yang paling ringan</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-black">Fantech X9 Thor</h3>

              <div className="mt-5">
                <p className="text-sm font-bold text-green-600">Kelebihan</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>✓ Harga paling terjangkau</p>
                  <p>✓ Memiliki tujuh tombol</p>
                  <p>✓ Cocok untuk pemula</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-bold text-red-600">Kekurangan</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>− DPI maksimal paling rendah</p>
                  <p>− Software lebih sederhana</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-black">Rexus Daxa Air IV</h3>

              <div className="mt-5">
                <p className="text-sm font-bold text-green-600">Kelebihan</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>✓ Bobot paling ringan</p>
                  <p>✓ Mendukung koneksi wireless</p>
                  <p>✓ DPI maksimal paling tinggi</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-bold text-red-600">Kekurangan</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>− Harga paling mahal</p>
                  <p>− Garansi hanya satu tahun</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-slate-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              Kesimpulan BelanjaLab
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Produk mana yang sebaiknya kamu pilih?
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {conclusions.map((item, index) => (
              <article
                key={item.product}
                className={`rounded-3xl border p-6 ${
                  index === 0
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-orange-400">
                  {item.title}
                </p>

                <h3 className="mt-4 text-xl font-black">{item.product}</h3>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {item.description}
                </p>

                <div className="mt-6 flex items-end justify-between border-t border-slate-800 pt-5">
                  <div>
                    <p className="text-xs text-slate-500">Skor BelanjaLab</p>
                    <p className="mt-1 text-3xl font-black text-green-400">
                      {item.score}
                    </p>
                  </div>

                  <a
                    href={
                      item.product === "Logitech G102 Lightsync"
                        ? "/product/logitech-g102-lightsync"
                        : "#"
                    }
                    className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-600"
                  >
                    Lihat Produk
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-xs leading-6 text-orange-900">
            Harga dan ketersediaan produk dapat berubah sewaktu-waktu.
            BelanjaLab dapat menerima komisi dari pembelian melalui tautan
            afiliasi tanpa biaya tambahan bagi pengguna.
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
