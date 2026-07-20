import { getSupabaseClient } from "./supabase";

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
  marketplaces?: MarketplaceRelation[] | MarketplaceRelation | null;
};

type SpecificationRelation = {
  spec_key: string;
  value_text: string;
};

type FeaturedProductRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  categories?: CategoryRelation[] | null;
  product_scores?: ScoreRelation[] | null;
  product_prices?: PriceRelation[] | null;
};

export type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: string;
  score: string;
  price: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  categories?: CategoryRelation[] | null;
  brands?: BrandRelation[] | null;
  product_scores?: ScoreRelation[] | null;
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

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
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
    const category = product.categories?.[0]?.name ?? "Produk";
    const score = product.product_scores?.[0]?.overall_score;
    const lowestPrice = getLowestPrice(product.product_prices);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl:
        product.image_url ?? "/images/products/logitech-g102.png",
      category,
      score:
        score !== null && score !== undefined
          ? `${Number(score).toFixed(1)}/10`
          : "Belum dinilai",
      price: formatRupiah(lowestPrice),
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
    .single();

  if (error) {
    console.error("Gagal mengambil detail produk:", error.message);
    return null;
  }

  const product = data as unknown as ProductDetail;

  return {
    ...product,
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
    const category = product.categories?.[0]?.name ?? "Produk";
    const score = product.product_scores?.[0]?.overall_score;
    const lowestPrice = getLowestPrice(product.product_prices);

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
      imageUrl:
        product.image_url ?? "/images/products/logitech-g102.png",
      category,
      score: Number(score ?? 0),
      price: lowestPrice,
      formattedPrice: formatRupiah(lowestPrice),
      specifications: specificationMap,
    };
  });
}
