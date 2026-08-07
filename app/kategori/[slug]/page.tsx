import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CategoryProductGrid from "@/components/category/category-product-grid";
import {
  getCategoryBySlug,
  getCategoryLandingData,
  getCategorySeoProfile,
} from "@/lib/categories";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 3600;

const CURRENT_YEAR = new Date().getFullYear();

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

function parsePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Kategori tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const profile = getCategorySeoProfile(category);
  const page = parsePage(query.page);
  const canonicalPath = `/kategori/${category.slug}`;
  const pageTitle = `${profile.titlePrefix} ${CURRENT_YEAR}`;

  return {
    title: page > 1 ? `${pageTitle} - Halaman ${page}` : pageTitle,
    description: profile.description,
    keywords: [
      category.name,
      `${category.name} terbaik`,
      `rekomendasi ${category.name}`,
      `harga ${category.name}`,
      `perbandingan ${category.name}`,
      "BelanjaLab",
    ],
    alternates: {
      canonical: canonicalPath,
    },
    robots:
      page > 1
        ? {
            index: false,
            follow: true,
          }
        : {
            index: true,
            follow: true,
          },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: "BelanjaLab",
      url: canonicalPath,
      title: pageTitle,
      description: profile.description,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: profile.description,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = parsePage(query.page);
  const data = await getCategoryLandingData(slug, page, 24);

  if (!data) {
    notFound();
  }

  if (data.total > 0 && page > data.totalPages) {
    notFound();
  }

  const { category, products, total, totalPages } = data;
  const profile = getCategorySeoProfile(category);
  const categoryUrl = `${SITE_URL}/kategori/${category.slug}`;
  const firstItemPosition = (page - 1) * data.pageSize;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${profile.titlePrefix} ${CURRENT_YEAR}`,
        description: profile.description,
        url: categoryUrl,
        inLanguage: "id-ID",
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
            item: `${SITE_URL}/kategori`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: categoryUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `Produk ${category.name}`,
        numberOfItems: total,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: firstItemPosition + index + 1,
          name: product.name,
          url: `${SITE_URL}/product/${product.slug}`,
        })),
      },
    ],
  };

  const rangeStart = total === 0 ? 0 : firstItemPosition + 1;
  const rangeEnd = Math.min(firstItemPosition + products.length, total);

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

      <section className="border-b border-slate-100 bg-slate-50 px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-orange-500">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/kategori" className="hover:text-orange-500">
              Kategori
            </Link>
            <span>/</span>
            <span className="text-slate-600">{category.name}</span>
          </nav>

          <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                {profile.eyebrow}
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
                {profile.titlePrefix} {CURRENT_YEAR}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                {profile.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Produk ditemukan
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {total.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {profile.popularSearches.length > 0 && (
        <section className="border-b border-slate-100 px-4 py-5 md:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold text-slate-500">
              Pencarian populer:
            </span>
            {profile.popularSearches.map((keyword) => (
              <Link
                key={keyword}
                href={`/search?q=${encodeURIComponent(keyword)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-orange-300 hover:text-orange-500"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black md:text-2xl">
                Pilihan {category.name}
              </h2>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                {total > 0
                  ? `Menampilkan ${rangeStart}–${rangeEnd} dari ${total.toLocaleString("id-ID")} produk published.`
                  : "Belum ada produk published pada kategori ini."}
              </p>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(category.name)}`}
              className="text-xs font-black text-orange-500 hover:text-orange-600 md:text-sm"
            >
              Cari lebih luas →
            </Link>
          </div>

          <CategoryProductGrid
            products={products}
            categoryName={category.name}
            categorySlug={category.slug}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
              Tentang kategori
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Memilih {category.name} dengan lebih yakin
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              {profile.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
              Sebelum membeli
            </p>
            <h2 className="mt-2 text-2xl font-black">3 hal yang perlu dicek</h2>
            <ol className="mt-6 space-y-5">
              {profile.buyingTips.map((tip, index) => (
                <li key={tip} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-orange-300">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-slate-300">
                    {tip}
                  </p>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
