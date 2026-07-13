export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-green-600">
            BelanjaLab
          </span>

          <nav className="hidden gap-6 text-sm font-medium text-gray-500 sm:flex">
            <a
              href="#fitur"
              className="transition-colors hover:text-gray-900"
            >
              Rekomendasi
            </a>

            <a
              href="#fitur"
              className="transition-colors hover:text-gray-900"
            >
              Perbandingan
            </a>

            <a
              href="#tentang"
              className="transition-colors hover:text-gray-900"
            >
              Tentang Kami
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-green-600">
          Belanja lebih cerdas
        </p>

        <h1 className="mb-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
          Temukan produk terbaik
          <br className="hidden sm:block" />
          dengan harga terbaik
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg text-gray-500">
          BelanjaLab membantu masyarakat Indonesia membandingkan dan menemukan
          rekomendasi produk yang tepat — cepat, jelas, dan terpercaya.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#fitur"
            className="inline-flex items-center justify-center rounded-full bg-green-600 px-7 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-green-700"
          >
            Mulai Sekarang
          </a>

          <a
            href="#tentang"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 px-7 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Pelajari Lebih Lanjut
          </a>
        </div>
      </section>

      {/* Feature cards */}
      <section id="fitur" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
            Kenapa BelanjaLab?
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                title: "Rekomendasi Cerdas",
                desc: "Dapatkan rekomendasi produk yang disesuaikan dengan kebutuhan dan anggaran Anda.",
                emoji: "🎯",
              },
              {
                title: "Perbandingan Mudah",
                desc: "Bandingkan produk dari berbagai toko secara berdampingan dalam hitungan detik.",
                emoji: "⚖️",
              },
              {
                title: "Terpercaya",
                desc: "Data harga dan ulasan dikurasi secara cermat untuk memastikan akurasi.",
                emoji: "✅",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-4 text-3xl">{feature.emoji}</div>

                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="tentang" className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-600">
            Tentang BelanjaLab
          </p>

          <h2 className="mb-5 text-3xl font-bold text-gray-900">
            Membantu kamu memilih dengan lebih yakin
          </h2>

          <p className="leading-relaxed text-gray-500">
            BelanjaLab dibuat untuk menyederhanakan proses mencari,
            membandingkan, dan memilih produk. Kami menyajikan informasi dengan
            bahasa yang mudah dipahami agar keputusan belanja terasa lebih
            praktis dan transparan.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} BelanjaLab. MVP in development.
      </footer>
    </main>
  );
}
