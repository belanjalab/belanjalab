import { createSupabaseServerClient } from "./supabase-server";

type MarketplaceRelation = {
  id: string;
  name: string;
};

type AdminProductPriceRow = {
  id: string;
  marketplace_id: string;
  price: number | string | null;
  original_price: number | string | null;
  shipping_cost: number | string | null;
  affiliate_url: string | null;
  is_available: boolean | null;
  stock_status: string | null;
  last_checked_at: string | null;
  marketplaces?: MarketplaceRelation | MarketplaceRelation[] | null;
};

export type AdminProductPrice = {
  id: string;
  marketplaceId: string;
  marketplaceName: string;
  price: number;
  originalPrice: number;
  shippingCost: number;
  affiliateUrl: string;
  isAvailable: boolean;
  stockStatus: string;
  lastCheckedAt: string | null;
};

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export async function getAdminProductPrices(
  productId: string,
): Promise<AdminProductPrice[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("product_prices")
    .select(`
      id,
      marketplace_id,
      price,
      original_price,
      shipping_cost,
      affiliate_url,
      is_available,
      stock_status,
      last_checked_at,
      marketplaces (
        id,
        name
      )
    `)
    .eq("product_id", productId)
    .order("price", { ascending: true });

  if (error) {
    console.error(
      "Gagal mengambil harga marketplace admin:",
      error.message,
    );
    return [];
  }

  const rows = (data ?? []) as unknown as AdminProductPriceRow[];

  return rows.map((item) => {
    const marketplace = getSingleRelation(item.marketplaces);

    return {
      id: item.id,
      marketplaceId: item.marketplace_id,
      marketplaceName: marketplace?.name ?? "Marketplace",
      price: toNumber(item.price),
      originalPrice: toNumber(item.original_price),
      shippingCost: toNumber(item.shipping_cost),
      affiliateUrl:
        item.affiliate_url && item.affiliate_url !== "#"
          ? item.affiliate_url
          : "",
      isAvailable: item.is_available ?? true,
      stockStatus: item.stock_status ?? "unknown",
      lastCheckedAt: item.last_checked_at,
    };
  });
}
