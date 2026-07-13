const products = [
  {
    name: "Logitech G102",
    price: "Rp179.000",
    score: "9.2/10",
    sensor: "8.000 DPI",
    connection: "Wired",
    weight: "85 g",
    rgb: true,
    buttons: "6",
    warranty: "2 tahun",
  },
  {
    name: "Fantech X9",
    price: "Rp165.000",
    score: "8.6/10",
    sensor: "7.200 DPI",
    connection: "Wired",
    weight: "91 g",
    rgb: true,
    buttons: "7",
    warranty: "1 tahun",
  },
  {
    name: "Rexus Daxa Air",
    price: "Rp499.000",
    score: "8.4/10",
    sensor: "16.000 DPI",
    connection: "Wireless",
    weight: "75 g",
    rgb: false,
    buttons: "6",
    warranty: "2 tahun",
  },
];

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 md:px-5 md:py-4">
          <a href="/" className="mr-3 text-lg md:hidden">
            ‹
          </a>

          <a href="/" className="flex items-center gap-2">
  <img
    src="/images/logo-belanjalab.png"
    alt="BelanjaLab"
    className="h-7 w-7 rounded-full object-cover md:h-10 md:w-10"
  />

  <span className="text-sm font-black md:text-xl">
    Belanja<span className="text-orange-500">Lab</span>
  </span>
</a>

          <button
            type="button"
            aria-label="Bagikan"
            className="ml-auto text-lg"
          >
            ↗
          </button>
        </div>
      </header>

      {/* Mobile comparison */}
      <section className="px-4 py-5 md:hidden">
        <div className="mx-auto max-w-md">
          <div className="mb-4">
            <h1 className="text-base font-black">Bandingkan Produk</h1>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Pilih hingga 3 produk untuk dibandingkan.
            </p>
          </div>

          {/* Product cards */}
          <div className="grid grid-cols-3 gap-2">
            {products.map((product) => (
              <article
                key={product.name}
                className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
              >
                <button
                  type="button"
                  className="absolute right-1.5 top-1.5 text-[10px] text-slate-400"
                  aria-label={`Hapus ${product.name}`}
                >
                  ×
                </button>

                <div className="flex h-20 items-center justify-center rounded-lg bg-slate-100 text-[8px] text-slate-400">
                  FOTO
                </div>

                <h2 className="mt-2 min-h-8 text-[9px] font-bold leading-4">
                  {product.name}
                </h2>

                <p className="mt-1 text-[8px] font-black text-orange-500">
                  {product.price}
                </p>
              </article>
            ))}
          </div>

          {/* Score */}
          <div className="mt-5">
            <h2 className="text-xs font-black">BelanjaLab Score</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {products.map((product, index) => (
                <div
                  key={product.name}
                  className={`rounded-xl p-3 text-center ${
                    index === 0 ? "bg-green-50" : "bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-sm font-black ${
                      index === 0 ? "text-green-600" : "text-green-500"
                    }`}
                  >
                    {product.score}
                  </p>
                  <p className="mt-1 text-[8px] text-slate-400">
                    {index === 0 ? "Sangat direkomendasikan" : "Direkomendasikan"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison rows */}
          <div className="mt-5 space-y-4">
            {[
              ["Harga", products.map((p) => p.price)],
              ["Sensor", products.map((p) => p.sensor)],
              ["Koneksi", products.map((p) => p.connection)],
              ["Berat", products.map((p) => p.weight)],
              ["RGB", products.map((p) => (p.rgb ? "✓" : "×"))],
              ["Tombol", products.map((p) => p.buttons)],
              ["Garansi", products.map((p) => p.warranty)],
            ].map(([label, values]) => (
              <section key={label as string}>
                <h3 className="text-[10px] font-black">{label}</h3>
                <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {(values as string[]).map((value, index) => (
                    <div
                      key={`${label}-${index}`}
                      className={`px-2 py-3 text-center text-[9px] font-semibold ${
                        index !== 2 ? "border-r border-slate-200" : ""
                      } ${
                        label === "RGB" && value === "✓"
                          ? "text-green-600"
                          : label === "RGB" && value === "×"
                            ? "text-red-500"
                            : "text-slate-700"
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Conclusion */}
          <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black">Kesimpulan BelanjaLab</p>
            <h2 className="mt-2 text-sm font-black text-green-600">
              Logitech G102
            </h2>
            <p className="mt-1 text-[9px] font-semibold text-green-600">
              Pilihan terbaik secara keseluruhan.
            </p>
            <p className="mt-3 text-[9px] leading-4 text-slate-500">
              Unggul pada sensor, kenyamanan, dan value tanpa selisih harga yang
              besar.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="rounded-full bg-green-500 px-3 py-2 text-center text-[8px] font-bold text-white">
                PEMENANG
              </span>
              <a
                href="/product/logitech-g102-lightsync"
                className="rounded-full bg-orange-500 px-3 py-2 text-center text-[8px] font-bold text-white"
              >
                Lihat Produk
              </a>
            </div>
          </section>

          <button
            type="button"
            className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-[10px] font-bold"
          >
            + Tambah Produk Lain
          </button>
        </div>
      </section>

      {/* Desktop comparison */}
      <section className="hidden px-5 py-12 md:block">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Bandingkan sebelum membeli
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black leading-tight">
            Temukan produk yang paling cocok untuk kebutuhanmu.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Lihat perbedaan harga, spesifikasi, kelebihan, dan skor produk dalam
            satu tampilan yang mudah dipahami.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-5">
            {products.map((product) => (
              <article
                key={product.name}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-44 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
                  FOTO PRODUK
                </div>
                <h2 className="mt-5 text-lg font-black">{product.name}</h2>
                <p className="mt-2 text-2xl font-black text-orange-500">
                  {product.price}
                </p>
                <p className="mt-4 text-3xl font-black text-green-600">
                  {product.score}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200">
            {[
              ["Harga", products.map((p) => p.price)],
              ["Sensor", products.map((p) => p.sensor)],
              ["Koneksi", products.map((p) => p.connection)],
              ["Berat", products.map((p) => p.weight)],
              ["RGB", products.map((p) => (p.rgb ? "Ya" : "Tidak"))],
              ["Tombol", products.map((p) => p.buttons)],
              ["Garansi", products.map((p) => p.warranty)],
            ].map(([label, values], rowIndex) => (
              <div
                key={label as string}
                className={`grid grid-cols-[220px_repeat(3,1fr)] ${
                  rowIndex !== 6 ? "border-b border-slate-200" : ""
                }`}
              >
                <div className="bg-slate-50 px-5 py-5 text-sm font-bold">
                  {label}
                </div>
                {(values as string[]).map((value, index) => (
                  <div
                    key={`${label}-${index}`}
                    className="border-l border-slate-200 px-5 py-5 text-sm font-semibold"
                  >
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom navigation mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {[
          ["⌂", "Beranda", "/"],
          ["▦", "Kategori", "/#kategori"],
          ["⌕", "Cari", "#"],
          ["⇄", "Compare", "/compare"],
          ["▤", "Artikel", "/#artikel"],
        ].map(([icon, label, href], index) => (
          <a
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 text-[9px] ${
              index === 3 ? "text-orange-500" : "text-slate-500"
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
