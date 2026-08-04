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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseClient();

  const [productsResult, articlesResult] = await Promise.all([
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

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = (
    (productsResult.data ?? []) as ProductSitemapRow[]
  ).map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updated_at
      ? new Date(product.updated_at)
      : new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const articleRoutes: MetadataRoute.Sitemap = (
    (articlesResult.data ?? []) as ArticleSitemapRow[]
  ).map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.updated_at
      ? new Date(article.updated_at)
      : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
