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

function validDate(value: string | null) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const supabase = getSupabaseClient();
    const [productsResult, articlesResult] = await Promise.all([
      supabase
        .from("products")
        .select("slug,updated_at")
        .eq("status", "published")
        .not("slug", "is", null)
        .order("updated_at", { ascending: false }),
      supabase
        .from("articles")
        .select("slug,updated_at")
        .eq("published", true)
        .not("slug", "is", null)
        .order("updated_at", { ascending: false }),
    ]);

    if (productsResult.error) {
      console.error("Gagal membuat sitemap produk:", productsResult.error.message);
    }

    if (articlesResult.error) {
      console.error("Gagal membuat sitemap artikel:", articlesResult.error.message);
    }

    const productRoutes: MetadataRoute.Sitemap = (
      (productsResult.data ?? []) as ProductSitemapRow[]
    ).map((product) => ({
      url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
      lastModified: validDate(product.updated_at),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const articleRoutes: MetadataRoute.Sitemap = (
      (articlesResult.data ?? []) as ArticleSitemapRow[]
    ).map((article) => ({
      url: `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`,
      lastModified: validDate(article.updated_at),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...articleRoutes];
  } catch (error) {
    console.error(
      "Sitemap dinamis gagal dibuat; menggunakan rute statis.",
      error instanceof Error ? error.message : error,
    );

    return staticRoutes;
  }
}
