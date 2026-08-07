import type { Metadata } from "next";
import Link from "next/link";

import CategoryVisual from "@/components/home/category-visual";
import { ArrowRightIcon } from "@/components/home/home-icons";
import Breadcrumbs from "@/components/site/breadcrumbs";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getCategoryIconKey } from "@/lib/categories";
import { getActiveSiteFooter } from "@/lib/footer";
import { getAllRecommendationPages } from "@/lib/recommendations";
import { SITE_URL } from "@/lib/site-config";

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

export default async function RecommendationHubPage() {
  const recommendations = getAllRecommendationPages();
  const footer = await getActiveSiteFooter();

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
    <>
      <SiteHeader active="recommendations" />

      <main
        id="konten-utama"
        className="min-h-screen bg-[#f6f6f6] pb-20 text-slate-900 md:pb-0"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />

        <Breadcrumbs
          items={[{ label: "Beranda", href: "/" }, { label: "Rekomendasi" }]}
        />

        <section className="px-4 py-6 md:px-5 md:py-9">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-700">
              Belanja lebih terarah
            </p>
            <h1 className="brand-text-balance mt-2 max-w-4xl text-3xl font-bold leading-[1.15] tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl">
              Rekomendasi Produk Terbaik {CURRENT_YEAR}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Mulai dari kebutuhan atau budget. BelanjaLab menyusun pilihan
              berdasarkan kategori, skor produk, dan harga marketplace.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12 md:px-5 md:pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {recommendations.map((item) => (
                <Link
                  key={item.slug}
                  href={`/rekomendasi/${item.slug}`}
                  className="public-card group flex min-h-56 gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg sm:p-6"
                >
                  <span
                    aria-hidden="true"
                    className="category-visual-shell relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-amber-50 to-orange-100 ring-1 ring-amber-100 sm:h-20 sm:w-20"
                  >
                    <CategoryVisual
                      icon={getCategoryIconKey(item.categorySlug, item.categorySlug)}
                      className="h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]"
                    />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">
                      {item.eyebrow}
                    </p>
                    <h2 className="mt-2 text-lg font-bold tracking-[-0.02em] text-slate-950 transition group-hover:text-amber-800 sm:text-xl">
                      {item.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                    <span className="mt-auto inline-flex min-h-10 items-end gap-1.5 pt-4 text-sm font-semibold text-amber-700">
                      Lihat rekomendasi <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white px-4 py-10 md:px-5 md:py-14">
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              Cara menggunakan BelanjaLab
            </p>
            <h2 className="mt-2 max-w-4xl text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Gunakan rekomendasi sebagai titik awal, lalu bandingkan detailnya
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Ranking membantu mempersempit pilihan. Buka halaman produk untuk
              melihat skor, spesifikasi, dan harga marketplace, lalu gunakan
              fitur perbandingan jika masih ada beberapa kandidat.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter footer={footer} />
      <MobileBottomNav />
    </>
  );
}
