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
  categories?: CategoryRelation[] | CategoryRelation | null;
  brands?: BrandRelation[] | BrandRelation | null;
  product_scores?: ScoreRelation[] | ScoreRelation | null;
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

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
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

function mapSearchProduct(product: SearchProductRow): SearchProduct {
  const category = getSingleRelation(product.categories);
  const brand = getSingleRelation(product.brands);
  const scoreRelation = getSingleRelation(product.product_scores);
  const lowestPrice = getLowestPrice(product.product_prices);

  const rawScore = scoreRelation?.overall_score;
  const numericScore =
    rawScore !== null && rawScore !== undefined ? Number(rawScore) : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription:
      product.short_description ?? "Deskripsi belum tersedia.",
    imageUrl:
      product.image_url ?? "/images/products/logitech-g102.png",
    category: category?.name ?? "Produk",
    brand: brand?.name ?? "Tanpa merek",
    score:
      numericScore !== null && Number.isFinite(numericScore)
        ? numericScore
        : null,
    lowestPrice,
    formattedPrice: formatRupiah(lowestPrice),
  };
}

const productSelect = `
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
`;

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

  const searchPattern = `%${query}%`;

  const [productResult, categoryResult, brandResult] =
    await Promise.all([
      supabase
        .from("products")
        .select(productSelect)
        .eq("status", "published")
        .or(
          `name.ilike.${searchPattern},short_description.ilike.${searchPattern},description.ilike.${searchPattern}`,
        )
        .limit(24),

      supabase
        .from("products")
        .select(`
          ${productSelect.replace(
            "categories (",
            "categories!inner (",
          )}
        `)
        .eq("status", "published")
        .ilike("categories.name", searchPattern)
        .limit(24),

      supabase
        .from("products")
        .select(`
          ${productSelect.replace(
            "brands (",
            "brands!inner (",
          )}
        `)
        .eq("status", "published")
        .ilike("brands.name", searchPattern)
        .limit(24),
    ]);

  const errors = [
    productResult.error,
    categoryResult.error,
    brandResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error("Gagal mencari produk:", error?.message);
    }
  }

  const mergedRows = new Map<string, SearchProductRow>();

  for (const row of [
    ...(productResult.data ?? []),
    ...(categoryResult.data ?? []),
    ...(brandResult.data ?? []),
  ] as unknown as SearchProductRow[]) {
    mergedRows.set(row.id, row);
  }

  return Array.from(mergedRows.values())
    .map(mapSearchProduct)
    .sort((a, b) => a.name.localeCompare(b.name, "id-ID"))
    .slice(0, 24);
}
