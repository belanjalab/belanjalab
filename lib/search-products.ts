import { getSafeImageUrl } from "./site-config";
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
  is_available?: boolean | null;
  stock_status?: string | null;
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

type SearchMatchRow = {
  id: string;
  name: string;
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

export type SearchProductsResult = {
  products: SearchProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type SearchProductsOptions = {
  page?: number;
  pageSize?: number;
};

export const DEFAULT_SEARCH_PAGE_SIZE = 24;
const MAX_SEARCH_MATCHES = 1000;

function normalizeSearchQuery(value: string) {
  return value
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value ?? fallback));
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
    .filter(
      (item) =>
        item.is_available !== false &&
        item.stock_status !== "out_of_stock",
    )
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);

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
    imageUrl: getSafeImageUrl(product.image_url),
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
    price,
    is_available,
    stock_status
  )
`;

function createEmptyResult(
  page: number,
  pageSize: number,
): SearchProductsResult {
  return {
    products: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
  };
}

export async function searchProducts(
  rawQuery: string,
  options: SearchProductsOptions = {},
): Promise<SearchProductsResult> {
  const query = normalizeSearchQuery(rawQuery);
  const requestedPage = normalizePositiveInteger(options.page, 1);
  const pageSize = Math.min(
    normalizePositiveInteger(options.pageSize, DEFAULT_SEARCH_PAGE_SIZE),
    48,
  );

  if (query.length < 2) {
    return createEmptyResult(requestedPage, pageSize);
  }

  const supabase = getSupabaseClient();
  const searchPattern = `%${query}%`;

  // Ambil kandidat ID terlebih dahulu. Dengan begitu jumlah hasil tetap akurat,
  // sementara detail lengkap hanya dimuat untuk halaman yang sedang dibuka.
  const [productResult, categoryResult, brandResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name")
      .eq("status", "published")
      .or(
        `name.ilike.${searchPattern},short_description.ilike.${searchPattern},description.ilike.${searchPattern}`,
      )
      .limit(MAX_SEARCH_MATCHES),

    supabase
      .from("products")
      .select("id, name, categories!inner(name)")
      .eq("status", "published")
      .ilike("categories.name", searchPattern)
      .limit(MAX_SEARCH_MATCHES),

    supabase
      .from("products")
      .select("id, name, brands!inner(name)")
      .eq("status", "published")
      .ilike("brands.name", searchPattern)
      .limit(MAX_SEARCH_MATCHES),
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

  const matchedProducts = new Map<string, SearchMatchRow>();

  for (const row of [
    ...(productResult.data ?? []),
    ...(categoryResult.data ?? []),
    ...(brandResult.data ?? []),
  ] as unknown as SearchMatchRow[]) {
    matchedProducts.set(row.id, {
      id: row.id,
      name: row.name,
    });
  }

  const sortedMatches = Array.from(matchedProducts.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "id-ID"),
  );

  const total = sortedMatches.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
  const offset = (page - 1) * pageSize;
  const pageMatches = sortedMatches.slice(offset, offset + pageSize);

  if (pageMatches.length === 0) {
    return {
      products: [],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  const pageIds = pageMatches.map((item) => item.id);
  const { data: productRows, error: productRowsError } = await supabase
    .from("products")
    .select(productSelect)
    .in("id", pageIds);

  if (productRowsError) {
    console.error(
      "Gagal mengambil detail hasil pencarian:",
      productRowsError.message,
    );

    return {
      products: [],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  const detailById = new Map<string, SearchProduct>();

  for (const row of (productRows ?? []) as unknown as SearchProductRow[]) {
    detailById.set(row.id, mapSearchProduct(row));
  }

  const products = pageMatches
    .map((item) => detailById.get(item.id))
    .filter((item): item is SearchProduct => Boolean(item));

  return {
    products,
    total,
    page,
    pageSize,
    totalPages,
  };
}
