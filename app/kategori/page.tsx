import type { Metadata } from "next";
import Link from "next/link";

import {
  getAllPublicCategories,
  getCategorySeoProfile,
} from "@/lib/categories";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kategori Produk: Gadget, Elektronik, Gaming & Lainnya",
  description:
    "Jelajahi kategori produk BelanjaLab untuk menemukan rekomendasi, skor, dan perbandingan harga gadget, elektronik, gaming, rumah tangga, dan lainnya.",
  alternates: {
    canonical: "/kategori",
  },
  openGraph: {
    title: "Kategori Produk BelanjaLab",
    description:
      "Jelajahi kategori produk dan temukan rekomendasi, skor, serta perbandingan harga di BelanjaLab.",
    url: "/kategori",
    siteName: "BelanjaLab",
    locale: "id_ID",
    type: "website",
  },
};

export default async function CategoriesPage() {
  const categories = await getAllPublicCategories();
  const categoryUrl = `${SITE_URL}/kategori`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Kategori Produk BelanjaLab",
        description:
          "Daftar kategori produk untuk rekomendasi dan perbandingan harga di BelanjaLab.",
        url: categoryUrl,
      },
      {
        "@type": "ItemList",
        itemListElement: categories.map((category, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: category.name,
          url: `${SITE_URL}/kategori/${category.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Kategori",
            item: categoryUrl,
          },
        ],
      },
    ],
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
            <Link href="/kategori" className="font-bold text-orange-500">
              Kategori
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
          <nav className="text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-orange-500">
              Beranda
            </Link>
            <span className="px-2">/</span>
            <span>Kategori</span>
          </nav>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-orange-500">
            Jelajahi Produk
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight md:text-5xl">
            Temukan produk berdasarkan kategori
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
            Mulai dari gadget, elektronik, kebutuhan rumah tangga sampai
            perangkat gaming. Setiap kategori membantu kamu menemukan produk,
            melihat skor BelanjaLab, dan membandingkan harga sebelum membeli.
          </p>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const profile = getCategorySeoProfile(category);

                return (
                  <Link
                    key={category.id}
                    href={`/kategori/${category.slug}`}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                        {category.icon}
                      </div>
                      <span className="text-sm font-black text-slate-300 transition group-hover:text-orange-500">
                        →
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-black">
                      {category.name}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {profile.description}
                    </p>
                    <p className="mt-5 text-xs font-black text-orange-500">
                      Lihat kategori →
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="font-black">Kategori belum tersedia.</p>
              <p className="mt-2 text-sm text-slate-500">
                Tambahkan kategori melalui dashboard admin.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
