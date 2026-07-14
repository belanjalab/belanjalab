import { getSupabaseClient } from "./supabase";

type CategoryRelation = {
  name: string;
};

type BrandRelation = {
  name: string;
};

type ScoreRelation = {
  overall_score?: number | string | null;
};

type PriceRelation = {
  price: number | string | null;
};

type SearchProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  categories?: CategoryRelation[] | null;
  brands?: BrandRelation[] | null;
  product_scores?: ScoreRelation[] | null;
  product_prices?: PriceRelation[] | null;
};

export type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  category: string;
  brand: string;
  score: number | null;
  lowestPrice: number | null;
  formattedPrice: string;
};

function normalizeSearchQuery(value: string) {
  return value
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function getLowestPrice(prices: PriceRelation[] | null | undefined) {
  const numericPrices = (prices ?? [])
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));

  return numericPrices.length > 0 ? Math.min(...numericPrices) : null;
}

function formatRupiah(value: number | null) {
  if (value === null) {
    return "Harga belum tersedia";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function searchProducts(
  rawQuery: string,
): Promise<SearchProduct[]> {
  const query = normalizeSearchQuery(rawQuery);

  if (query.length < 2) {
    return [];
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error("Konfigurasi Supabase belum tersedia.");
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      image_url,
      categories (
        name
      ),
      brands (
        name
      ),
      product_scores (
        overall_score
      ),
      product_prices (
        price
      )
    `)
    .eq("status", "published")
    .or(
      `name.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`,
    )
    .order("name", { ascending: true })
    .limit(24);

  if (error) {
    console.error("Gagal mencari produk:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as SearchProductRow[];

  return rows.map((product) => {
    const score = product.product_scores?.[0]?.overall_score;
    const lowestPrice = getLowestPrice(product.product_prices);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription:
        product.short_description ?? "Deskripsi belum tersedia.",
      imageUrl:
        product.image_url ?? "/images/products/logitech-g102.png",
      category: product.categories?.[0]?.name ?? "Produk",
      brand: product.brands?.[0]?.name ?? "Tanpa merek",
      score:
        score !== null && score !== undefined
          ? Number(score)
          : null,
      lowestPrice,
      formattedPrice: formatRupiah(lowestPrice),
    };
  });
}
