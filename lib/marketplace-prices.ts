import { getSupabaseClient } from "./supabase";

type MarketplaceRelation = {
  name: string;
};

type ProductPriceRow = {
  id: string;
  price: number | string | null;
  original_price: number | string | null;
  shipping_cost: number | string | null;
  affiliate_url: string | null;
  is_available: boolean | null;
  stock_status: string | null;
  last_checked_at: string | null;
  marketplaces?: MarketplaceRelation[] | null;
};

type PriceHistoryRow = {
  product_price_id: string;
  price: number | string;
  captured_at: string;
};

export type MarketplaceOffer = {
  id: string;
  marketplace: string;
  price: number;
  originalPrice: number | null;
  shippingCost: number;
  totalPrice: number;
  formattedPrice: string;
  formattedOriginalPrice: string | null;
  formattedShippingCost: string;
  formattedTotalPrice: string;
  affiliateUrl: string | null;
  isAvailable: boolean;
  stockStatus: string;
  lastCheckedAt: string | null;
  priceHistory: Array<{
    price: number;
    capturedAt: string;
  }>;
};

export type MarketplacePriceResult = {
  productId: string;
  productName: string;
  productSlug: string;
  offers: MarketplaceOffer[];
};

function toNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function getMarketplaceOffersByProductSlug(
  slug: string,
): Promise<MarketplacePriceResult | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error("Konfigurasi Supabase belum tersedia.");
    return null;
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      product_prices (
        id,
        price,
        original_price,
        shipping_cost,
        affiliate_url,
        is_available,
        stock_status,
        last_checked_at,
        marketplaces (
          name
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (productError || !product) {
    console.error(
      "Gagal mengambil harga marketplace:",
      productError?.message ?? "Produk tidak ditemukan.",
    );
    return null;
  }

  const priceRows = (
    Array.isArray(product.product_prices)
      ? product.product_prices
      : []
  ) as unknown as ProductPriceRow[];

  const priceIds = priceRows.map((item) => item.id);
  let historyRows: PriceHistoryRow[] = [];

  if (priceIds.length > 0) {
    const { data: history, error: historyError } = await supabase
      .from("product_price_history")
      .select(`
        product_price_id,
        price,
        captured_at
      `)
      .in("product_price_id", priceIds)
      .order("captured_at", { ascending: true })
      .limit(300);

    if (historyError) {
      console.error(
        "Gagal mengambil riwayat harga:",
        historyError.message,
      );
    } else {
      historyRows = (history ?? []) as PriceHistoryRow[];
    }
  }

  const offers = priceRows
    .map((offer) => {
      const price = toNumber(offer.price);
      const originalPrice =
        offer.original_price === null
          ? null
          : toNumber(offer.original_price);
      const shippingCost = toNumber(offer.shipping_cost);
      const totalPrice = price + shippingCost;

      return {
        id: offer.id,
        marketplace:
          offer.marketplaces?.[0]?.name ?? "Marketplace",
        price,
        originalPrice,
        shippingCost,
        totalPrice,
        formattedPrice: formatRupiah(price),
        formattedOriginalPrice:
          originalPrice !== null
            ? formatRupiah(originalPrice)
            : null,
        formattedShippingCost:
          shippingCost > 0
            ? formatRupiah(shippingCost)
            : "Gratis ongkir",
        formattedTotalPrice: formatRupiah(totalPrice),
        affiliateUrl: offer.affiliate_url,
        isAvailable: offer.is_available ?? false,
        stockStatus: offer.stock_status ?? "unknown",
        lastCheckedAt: offer.last_checked_at,
        priceHistory: historyRows
          .filter(
            (history) =>
              history.product_price_id === offer.id,
          )
          .map((history) => ({
            price: toNumber(history.price),
            capturedAt: history.captured_at,
          })),
      };
    })
    .sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }

      return a.totalPrice - b.totalPrice;
    });

  return {
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    offers,
  };
}
