import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase";

export const revalidate = 3600;

type ProductSitemapRow = {
  slug: string;
  updated_at: string | null;
};

type ArticleSitemapRow = {
  slug: string;
  updated_at: string | null;
};

type CategorySitemapRow = {
  slug: string;
  created_at: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseClient();

  const [productsResult, articlesResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug,updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false }),
    supabase
      .from("articles")
      .select("slug,updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false }),
    supabase
      .from("categories")
      .select("slug,created_at")
      .order("name", { ascending: true }),
  ]);

  if (productsResult.error) {
    console.error(
      "Gagal membuat sitemap produk:",
      productsResult.error.message,
    );
  }

  if (articlesResult.error) {
    console.error(
      "Gagal membuat sitemap artikel:",
      articlesResult.error.message,
    );
  }

  if (categoriesResult.error) {
    console.error(
      "Gagal membuat sitemap kategori:",
      categoriesResult.error.message,
    );
  }

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
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = (
    (categoriesResult.data ?? []) as CategorySitemapRow[]
  )
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      url: `${SITE_URL}/kategori/${category.slug}`,
      lastModified: category.created_at
        ? new Date(category.created_at)
        : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  const productRoutes: MetadataRoute.Sitemap = (
    (productsResult.data ?? []) as ProductSitemapRow[]
  ).map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updated_at
      ? new Date(product.updated_at)
      : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const articleRoutes: MetadataRoute.Sitemap = (
    (articlesResult.data ?? []) as ArticleSitemapRow[]
  ).map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.updated_at
      ? new Date(article.updated_at)
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...articleRoutes,
  ];
}
