import type { Metadata } from "next";
import Link from "next/link";

import CategoryVisual from "@/components/home/category-visual";
import { ArrowRightIcon } from "@/components/home/home-icons";
import Breadcrumbs from "@/components/site/breadcrumbs";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import {
  getAllPublicCategories,
  getCategorySeoProfile,
} from "@/lib/categories";
import { getActiveSiteFooter } from "@/lib/footer";
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
  const [categories, footer] = await Promise.all([
    getAllPublicCategories(),
    getActiveSiteFooter(),
  ]);
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
    <>
      <SiteHeader active="categories" />

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
          items={[{ label: "Beranda", href: "/" }, { label: "Kategori" }]}
        />

        <section className="px-4 py-6 md:px-5 md:py-9">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-700">
              Jelajahi produk
            </p>
            <h1 className="brand-text-balance mt-2 max-w-4xl text-3xl font-bold leading-[1.15] tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl">
              Temukan produk berdasarkan kebutuhanmu
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Pilih kategori untuk melihat rekomendasi, skor BelanjaLab, dan
              perbandingan harga sebelum membeli.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12 md:px-5 md:pb-16">
          <div className="mx-auto max-w-7xl">
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {categories.map((category) => {
                  const profile = getCategorySeoProfile(category);

                  return (
                    <Link
                      key={category.id}
                      href={`/kategori/${category.slug}`}
                      className="category-card public-card group flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg sm:min-h-60 sm:p-5"
                    >
                      <span
                        aria-hidden="true"
                        className="category-visual-shell relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-amber-50 to-orange-100 ring-1 ring-amber-100 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:h-24 sm:w-24"
                      >
                        <CategoryVisual
                          icon={category.icon}
                          className="h-[4.5rem] w-[4.5rem] sm:h-[5.25rem] sm:w-[5.25rem]"
                        />
                      </span>

                      <h2 className="mt-4 text-base font-bold tracking-[-0.02em] text-slate-950 transition group-hover:text-amber-800 sm:text-lg">
                        {category.name}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        {profile.description}
                      </p>
                      <span className="mt-auto inline-flex min-h-10 items-end gap-1.5 pt-4 text-sm font-semibold text-amber-700">
                        Lihat kategori <ArrowRightIcon />
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="font-bold text-slate-900">
                  Kategori belum tersedia.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Tambahkan kategori melalui dashboard admin.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter footer={footer} />
      <MobileBottomNav active="categories" />
    </>
  );
}
