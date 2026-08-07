import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryLandingView from "@/components/category/category-landing-view";
import {
  getCategoryBySlug,
  getCategoryLandingData,
  getCategorySeoProfile,
} from "@/lib/categories";
import { getActiveSiteFooter } from "@/lib/footer";
import {
  hasCategoryFacets,
  parseCategoryFilters,
  parseCategoryPage,
  type CategorySearchParams,
} from "@/lib/category-navigation";

export const revalidate = 3600;

const CURRENT_YEAR = new Date().getFullYear();

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<CategorySearchParams>;
};

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

  const page = parseCategoryPage(query.page);
  const filters = parseCategoryFilters(query);
  const hasFacets = hasCategoryFacets(filters);
  const profile = getCategorySeoProfile(category);
  const canonicalPath = `/kategori/${category.slug}`;
  const pageTitle = `${profile.titlePrefix} ${CURRENT_YEAR}`;
  const shouldIndex = page === 1 && !hasFacets;

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
    robots: {
      index: shouldIndex,
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
  const requestedPage = parseCategoryPage(query.page);
  const filters = parseCategoryFilters(query);
  const [data, footer] = await Promise.all([
    getCategoryLandingData(slug, requestedPage, 24, filters),
    getActiveSiteFooter(),
  ]);

  if (!data) {
    return notFound();
  }

  if (data.total > 0 && requestedPage > data.totalPages) {
    return notFound();
  }

  const profile = getCategorySeoProfile(data.category);
  const canonicalPath = `/kategori/${data.category.slug}`;

  return (
    <CategoryLandingView
      data={data}
      profile={profile}
      basePath={canonicalPath}
      canonicalPath={canonicalPath}
      footer={footer}
    />
  );
}
