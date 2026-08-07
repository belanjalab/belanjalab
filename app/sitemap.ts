import type { MetadataRoute } from "next";

import {
  getCategorySubcategories,
  matchesCategorySubcategoryText,
} from "@/lib/categories";
import { SITE_URL } from "@/lib/site-config";
import { getAllRecommendationPages } from "@/lib/recommendations";
import { getSupabaseClient } from "@/lib/supabase";

export const revalidate = 3600;

type ProductSitemapRow = {
  slug: string;
  updated_at: string | null;
  category_id: string | null;
  name: string;
  short_description: string | null;
};

type ArticleSitemapRow = {
  slug: string;
  updated_at: string | null;
};

type CategorySitemapRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseClient();

  const [productsResult, articlesResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug,updated_at,category_id,name,short_description")
      .eq("status", "published")
      .order("updated_at", { ascending: false }),
    supabase
      .from("articles")
      .select("slug,updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id,name,slug,created_at")
      .order("name", { ascending: true }),
  ]);

  if (productsResult.error) {
    console.error("Gagal membuat sitemap produk:", productsResult.error.message);
  }

  if (articlesResult.error) {
    console.error("Gagal membuat sitemap artikel:", articlesResult.error.message);
  }

  if (categoriesResult.error) {
    console.error(
      "Gagal membuat sitemap kategori:",
      categoriesResult.error.message,
    );
  }

  const products = (productsResult.data ?? []) as ProductSitemapRow[];
  const categories = (categoriesResult.data ?? []) as CategorySitemapRow[];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/kategori`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/rekomendasi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      url: `${SITE_URL}/kategori/${category.slug}`,
      lastModified: category.created_at
        ? new Date(category.created_at)
        : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  const subcategoryRoutes: MetadataRoute.Sitemap = categories.flatMap(
    (category) =>
      getCategorySubcategories(category)
        .filter((subcategory) =>
          products.some(
            (product) =>
              product.category_id === category.id &&
              matchesCategorySubcategoryText(
                product.name,
                product.short_description,
                subcategory,
              ),
          ),
        )
        .map((subcategory) => ({
          url: `${SITE_URL}/kategori/${category.slug}/${subcategory.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.85,
        })),
  );

  const recommendationRoutes: MetadataRoute.Sitemap =
    getAllRecommendationPages().map((recommendation) => ({
      url: `${SITE_URL}/rekomendasi/${recommendation.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const articleRoutes: MetadataRoute.Sitemap = (
    (articlesResult.data ?? []) as ArticleSitemapRow[]
  ).map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...subcategoryRoutes,
    ...recommendationRoutes,
    ...productRoutes,
    ...articleRoutes,
  ];
}
