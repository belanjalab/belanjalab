import { getSafeImageUrl } from "./site-config";
import { getSupabaseClient } from "./supabase";

type Relation<T> = T | T[] | null | undefined;

type CategoryRelation = {
  name: string;
};

type BrandRelation = {
  name: string;
};

type ScoreRelation = {
  performance?: number | string | null;
  design?: number | string | null;
  features?: number | string | null;
  value?: number | string | null;
  ease_of_use?: number | string | null;
  overall_score?: number | string | null;
};

type MarketplaceRelation = {
  name: string;
};

type PriceRelation = {
  price: number | string | null;
  original_price?: number | string | null;
  shipping_cost?: number | string | null;
  affiliate_url?: string | null;
  is_available?: boolean | null;
  stock_status?: string | null;
  last_checked_at?: string | null;
  updated_at?: string | null;
  marketplaces?: Relation<MarketplaceRelation>;
};

type SpecificationRelation = {
  spec_key: string;
  value_text: string;
};

type FeaturedProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  image_url: string | null;
  categories?: Relation<CategoryRelation>;
  brands?: Relation<BrandRelation>;
  product_scores?: Relation<ScoreRelation>;
  product_prices?: PriceRelation[] | null;
};

export type ProductScoreDimension = {
  key: "performance" | "design" | "features" | "value" | "ease_of_use";
  label: string;
  value: number;
};

export type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: string;
  brand: string | null;
  shortDescription: string | null;
  score: string;
  scoreValue: number | null;
  scoreVerdict: string;
  scoreBreakdown: ProductScoreDimension[];
  topStrength: ProductScoreDimension | null;
  price: string;
  priceValue: number | null;
  priceSourceCount: number;
  priceFreshness: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  categories?: Relation<CategoryRelation>;
  brands?: Relation<BrandRelation>;
  product_scores?: Relation<ScoreRelation>;
  product_prices?: PriceRelation[] | null;
};

type CompareProductRow = FeaturedProductRow & {
  product_specifications?: SpecificationRelation[] | null;
};

export type CompareProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: string;
  score: number;
  price: number | null;
  formattedPrice: string;
  specifications: Record<string, string>;
};

export function getSingleRelation<T>(
  relation: Relation<T>,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
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

function isUsablePrice(price: PriceRelation) {
  const numericPrice = Number(price.price);

  return (
    Number.isFinite(numericPrice) &&
    numericPrice > 0 &&
    price.is_available !== false &&
    price.stock_status !== "out_of_stock"
  );
}

function getLowestPrice(prices: PriceRelation[] | null | undefined) {
  const numericPrices = (prices ?? [])
    .filter(isUsablePrice)
    .map((item) => Number(item.price));

  return numericPrices.length > 0 ? Math.min(...numericPrices) : null;
}

const scoreDimensionDefinitions: Array<{
  key: ProductScoreDimension["key"];
  label: string;
}> = [
  { key: "performance", label: "Performa" },
  { key: "design", label: "Desain" },
  { key: "features", label: "Fitur" },
  { key: "value", label: "Value" },
  { key: "ease_of_use", label: "Kemudahan" },
];

function getScoreBreakdown(score: ScoreRelation | null) {
  if (!score) {
    return [];
  }

  return scoreDimensionDefinitions.flatMap((dimension) => {
    const numericValue = Number(score[dimension.key]);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return [];
    }

    return [{ ...dimension, value: numericValue }];
  });
}

function getScoreVerdict(score: number | null) {
  if (score === null) {
    return "Belum dinilai";
  }

  if (score >= 8.5) {
    return "Sangat baik";
  }

  if (score >= 7.5) {
    return "Baik";
  }

  if (score >= 6.5) {
    return "Cukup baik";
  }

  return "Perlu dipertimbangkan";
}

function getLatestPriceCheck(prices: PriceRelation[]) {
  const timestamps = prices
    .map((price) => price.last_checked_at ?? price.updated_at)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()));

  if (timestamps.length === 0) {
    return null;
  }

  return timestamps.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

function formatPriceFreshness(lastCheckedAt: Date | null) {
  if (!lastCheckedAt) {
    return "Waktu cek belum tersedia";
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const checkedDate = new Date(
    lastCheckedAt.getFullYear(),
    lastCheckedAt.getMonth(),
    lastCheckedAt.getDate(),
  );
  const differenceInDays = Math.max(
    0,
    Math.floor((today.getTime() - checkedDate.getTime()) / 86_400_000),
  );

  if (differenceInDays === 0) {
    return "Diperbarui hari ini";
  }

  if (differenceInDays === 1) {
    return "Diperbarui kemarin";
  }

  if (differenceInDays <= 30) {
    return `Diperbarui ${differenceInDays} hari lalu`;
  }

  return `Diperbarui ${new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year:
      lastCheckedAt.getFullYear() === now.getFullYear()
        ? undefined
        : "numeric",
  }).format(lastCheckedAt)}`;
}

function getPriceSourceCount(prices: PriceRelation[]) {
  const marketplaceNames = new Set(
    prices
      .map((price) => getSingleRelation(price.marketplaces)?.name)
      .filter((value): value is string => Boolean(value)),
  );

  return marketplaceNames.size > 0 ? marketplaceNames.size : prices.length;
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = getSupabaseClient();

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
        performance,
        design,
        features,
        value,
        ease_of_use,
        overall_score
      ),
      product_prices (
        price,
        is_available,
        stock_status,
        last_checked_at,
        updated_at,
        marketplaces (
          name
        )
      )
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("featured_order", {
      ascending: true,
      nullsFirst: false,
    })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Gagal mengambil featured products:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as FeaturedProductRow[];

  return rows.map((product) => {
    const category = getSingleRelation(product.categories);
    const brand = getSingleRelation(product.brands);
    const score = getSingleRelation(product.product_scores);
    const usablePrices = (product.product_prices ?? []).filter(isUsablePrice);
    const lowestPrice = getLowestPrice(usablePrices);
    const numericScore = Number(score?.overall_score);
    const scoreValue = Number.isFinite(numericScore) && numericScore > 0
      ? numericScore
      : null;
    const scoreBreakdown = getScoreBreakdown(score);
    const topStrength = scoreBreakdown.reduce<ProductScoreDimension | null>(
      (highest, dimension) =>
        !highest || dimension.value > highest.value ? dimension : highest,
      null,
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: getSafeImageUrl(product.image_url),
      category: category?.name ?? "Produk",
      brand: brand?.name ?? null,
      shortDescription: product.short_description ?? null,
      score: scoreValue !== null
        ? `${scoreValue.toFixed(1)}/10`
        : "Belum dinilai",
      scoreValue,
      scoreVerdict: getScoreVerdict(scoreValue),
      scoreBreakdown,
      topStrength,
      price: formatRupiah(lowestPrice),
      priceValue: lowestPrice,
      priceSourceCount: getPriceSourceCount(usablePrices),
      priceFreshness: formatPriceFreshness(getLatestPriceCheck(usablePrices)),
    };
  });
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      image_url,
      categories (
        name
      ),
      brands (
        name
      ),
      product_scores (
        performance,
        design,
        features,
        value,
        ease_of_use,
        overall_score
      ),
      product_prices (
        price,
        original_price,
        shipping_cost,
        affiliate_url,
        is_available,
        stock_status,
        last_checked_at,
        updated_at,
        marketplaces (
          name
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil detail produk:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const product = data as unknown as ProductDetail;

  return {
    ...product,
    image_url: getSafeImageUrl(product.image_url),
    product_prices: (product.product_prices ?? []).filter(isUsablePrice),
  };
}

export async function getCompareProducts(): Promise<CompareProduct[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      image_url,
      categories (
        name
      ),
      product_scores (
        overall_score
      ),
      product_prices (
        price,
        is_available,
        stock_status
      ),
      product_specifications (
        spec_key,
        value_text
      )
    `)
    .eq("status", "published")
    .order("name", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Gagal mengambil produk compare:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as CompareProductRow[];

  return rows.map((product) => {
    const category = getSingleRelation(product.categories);
    const score = getSingleRelation(product.product_scores);
    const lowestPrice = getLowestPrice(product.product_prices);
    const numericScore = Number(score?.overall_score ?? 0);

    const specificationMap = Object.fromEntries(
      (product.product_specifications ?? []).map((item) => [
        item.spec_key,
        item.value_text,
      ]),
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: getSafeImageUrl(product.image_url),
      category: category?.name ?? "Produk",
      score: Number.isFinite(numericScore) ? numericScore : 0,
      price: lowestPrice,
      formattedPrice: formatRupiah(lowestPrice),
      specifications: specificationMap,
    };
  });
}
