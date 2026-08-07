import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryLandingView from "@/components/category/category-landing-view";
import {
  getCategoryBySlug,
  getCategoryLandingData,
  getCategorySubcategory,
} from "@/lib/categories";
import {
  hasCategoryFacets,
  parseCategoryFilters,
  parseCategoryPage,
  type CategorySearchParams,
} from "@/lib/category-navigation";

export const revalidate = 3600;

const CURRENT_YEAR = new Date().getFullYear();

type SubcategoryPageProps = {
  params: Promise<{
    slug: string;
    subslug: string;
  }>;
  searchParams: Promise<CategorySearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: SubcategoryPageProps): Promise<Metadata> {
  const [{ slug, subslug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Subkategori tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const subcategory = getCategorySubcategory(category, subslug);

  if (!subcategory) {
    return {
      title: "Subkategori tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const page = parseCategoryPage(query.page);
  const filters = parseCategoryFilters(query);
  const hasFacets = hasCategoryFacets(filters);
  const profile = subcategory.profile;
  const canonicalPath = `/kategori/${category.slug}/${subcategory.slug}`;
  const pageTitle = `${profile.titlePrefix} ${CURRENT_YEAR}`;
  const shouldIndex = page === 1 && !hasFacets;

  return {
    title: page > 1 ? `${pageTitle} - Halaman ${page}` : pageTitle,
    description: profile.description,
    keywords: [
      subcategory.name,
      `${subcategory.name} terbaik`,
      `rekomendasi ${subcategory.name}`,
      `harga ${subcategory.name}`,
      category.name,
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

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const [{ slug, subslug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return notFound();
  }

  const subcategory = getCategorySubcategory(category, subslug);

  if (!subcategory) {
    return notFound();
  }

  const requestedPage = parseCategoryPage(query.page);
  const filters = {
    ...parseCategoryFilters(query),
    subcategory: subcategory.slug,
  };
  const data = await getCategoryLandingData(
    category.slug,
    requestedPage,
    24,
    filters,
  );

  if (!data || data.total === 0) {
    return notFound();
  }

  if (requestedPage > data.totalPages) {
    return notFound();
  }

  const canonicalPath = `/kategori/${category.slug}/${subcategory.slug}`;

  return (
    <CategoryLandingView
      data={data}
      profile={subcategory.profile}
      basePath={canonicalPath}
      canonicalPath={canonicalPath}
      subcategory={subcategory}
    />
  );
}
