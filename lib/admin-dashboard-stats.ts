import { createSupabaseServerClient } from "./supabase-server";

export type AdminDashboardStats = {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalCategories: number;
  totalBrands: number;
  productsWithoutPrice: number;
  productsWithoutScore: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createSupabaseServerClient();

  const [
    totalProductsResult,
    publishedProductsResult,
    draftProductsResult,
    totalCategoriesResult,
    totalBrandsResult,
    productsWithoutPriceResult,
    productsWithoutScoreResult,
  ] = await Promise.all([
    supabase
      .from("admin_product_catalog")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("admin_product_catalog")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),

    supabase
      .from("admin_product_catalog")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),

    supabase
      .from("categories")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("brands")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("admin_product_catalog")
      .select("id", { count: "exact", head: true })
      .is("lowest_price", null),

    supabase
      .from("admin_product_catalog")
      .select("id", { count: "exact", head: true })
      .is("score", null),
  ]);

  const errors = [
    totalProductsResult.error,
    publishedProductsResult.error,
    draftProductsResult.error,
    totalCategoriesResult.error,
    totalBrandsResult.error,
    productsWithoutPriceResult.error,
    productsWithoutScoreResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(
        "Gagal mengambil statistik dashboard admin:",
        error?.message,
      );
    }
  }

  return {
    totalProducts: totalProductsResult.count ?? 0,
    publishedProducts: publishedProductsResult.count ?? 0,
    draftProducts: draftProductsResult.count ?? 0,
    totalCategories: totalCategoriesResult.count ?? 0,
    totalBrands: totalBrandsResult.count ?? 0,
    productsWithoutPrice: productsWithoutPriceResult.count ?? 0,
    productsWithoutScore: productsWithoutScoreResult.count ?? 0,
  };
}
