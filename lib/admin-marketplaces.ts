import { createSupabaseServerClient } from "./supabase-server";

export type AdminMarketplace = {
  id: string;
  name: string;
  priceCount: number;
  productCount: number;
};

type MarketplaceRow = {
  id: string;
  name: string;
};

type MarketplaceUsageRow = {
  marketplace_id: string;
  product_id: string;
};

export async function getAdminMarketplaces(): Promise<
  AdminMarketplace[]
> {
  const supabase = await createSupabaseServerClient();

  const [
    { data: marketplaceRows, error: marketplaceError },
    { data: usageRows, error: usageError },
  ] = await Promise.all([
    supabase
      .from("marketplaces")
      .select("id, name")
      .order("name", { ascending: true }),

    supabase
      .from("product_prices")
      .select("marketplace_id, product_id"),
  ]);

  if (marketplaceError) {
    console.error(
      "Gagal mengambil daftar marketplace admin:",
      marketplaceError.message,
    );

    return [];
  }

  if (usageError) {
    console.error(
      "Gagal mengambil penggunaan marketplace:",
      usageError.message,
    );
  }

  const usageByMarketplace = new Map<
    string,
    {
      priceCount: number;
      productIds: Set<string>;
    }
  >();

  for (const usage of (usageRows ?? []) as MarketplaceUsageRow[]) {
    const current = usageByMarketplace.get(usage.marketplace_id) ?? {
      priceCount: 0,
      productIds: new Set<string>(),
    };

    current.priceCount += 1;
    current.productIds.add(usage.product_id);

    usageByMarketplace.set(usage.marketplace_id, current);
  }

  return ((marketplaceRows ?? []) as MarketplaceRow[]).map(
    (marketplace) => {
      const usage = usageByMarketplace.get(marketplace.id);

      return {
        id: marketplace.id,
        name: marketplace.name,
        priceCount: usage?.priceCount ?? 0,
        productCount: usage?.productIds.size ?? 0,
      };
    },
  );
}
