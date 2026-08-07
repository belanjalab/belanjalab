import type { Metadata } from "next";
import Link from "next/link";

import { SITE_URL } from "@/lib/site-config";
import { getAllRecommendationPages } from "@/lib/recommendations";

export const revalidate = 3600;

const CURRENT_YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Rekomendasi Produk Terbaik ${CURRENT_YEAR}`,
  description:
    "Jelajahi rekomendasi produk terbaik dari BelanjaLab berdasarkan kategori, budget, skor produk, dan harga marketplace.",
  alternates: {
    canonical: "/rekomendasi",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "BelanjaLab",
    url: "/rekomendasi",
    title: `Rekomendasi Produk Terbaik ${CURRENT_YEAR}`,
    description:
      "Jelajahi rekomendasi produk terbaik berdasarkan kategori, budget, skor produk, dan harga marketplace.",
  },
};

export default function RecommendationHubPage() {
  const recommendations = getAllRecommendationPages();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Rekomendasi Produk Terbaik ${CURRENT_YEAR}`,
    description:
      "Kumpulan halaman rekomendasi produk BelanjaLab berdasarkan kategori dan rentang harga.",
    url: `${SITE_URL}/rekomendasi`,
    inLanguage: "id-ID",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: recommendations.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE_URL}/rekomendasi/${item.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />
            <span className="text-base font-black md:text-xl">
              Belanja<span className="text-orange-500">Lab</span>
            </span>
          </Link>

          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <Link href="/kategori" className="hover:text-slate-950">
              Kategori
            </Link>
            <Link href="/rekomendasi" className="font-bold text-orange-500">
              Rekomendasi
            </Link>
            <Link href="/compare" className="hover:text-slate-950">
              Perbandingan
            </Link>
            <Link href="/articles" className="hover:text-slate-950">
              Artikel
            </Link>
          </nav>

          <Link
            href="/search"
            className="ml-auto rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500 md:px-4 md:text-sm"
          >
            Cari Produk
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-100 bg-slate-50 px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-orange-500">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-slate-600">Rekomendasi</span>
          </nav>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-orange-500">
            Belanja lebih terarah
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            Rekomendasi Produk Terbaik {CURRENT_YEAR}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
            Mulai dari kebutuhan atau budget. BelanjaLab menyusun landing page
            rekomendasi berdasarkan produk published, skor, kategori, dan harga
            marketplace yang tersedia.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <Link
                key={item.slug}
                href={`/rekomendasi/${item.slug}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-500">
                  {item.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-900 group-hover:text-orange-500">
                  {item.title} {CURRENT_YEAR}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
                <span className="mt-5 inline-flex text-xs font-black text-slate-900 group-hover:text-orange-500">
                  Lihat rekomendasi →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
            Cara menggunakan BelanjaLab
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Gunakan rekomendasi sebagai titik awal, lalu bandingkan detailnya
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
            Ranking membantu mempersempit pilihan, tetapi keputusan akhir tetap
            perlu mempertimbangkan kebutuhan pribadi. Buka halaman produk untuk
            melihat skor, spesifikasi, harga marketplace, lalu gunakan fitur
            perbandingan jika kamu masih memiliki beberapa kandidat.
          </p>
        </div>
      </section>
    </main>
  );
}
