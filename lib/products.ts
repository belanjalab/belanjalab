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
  affiliate_url?: string | null;
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

function getLowestPrice(prices: PriceRelation[] | null | undefined) {
  const numericPrices = (prices ?? [])
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));

  return numericPrices.length > 0 ? Math.min(...numericPrices) : null;
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
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
      image_url,
      categories (
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
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Gagal mengambil produk:", error.message);
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

  if (!supabase) {
    console.error("Konfigurasi Supabase belum tersedia.");
    return null;
  }

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
        affiliate_url,
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

  return data as unknown as ProductDetail;
}

export async function getCompareProducts(): Promise<CompareProduct[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error("Konfigurasi Supabase belum tersedia.");
    return [];
  }

  const compareSlugs = [
    "logitech-g102-lightsync",
    "fantech-x9-thor",
    "rexus-daxa-air-iv",
  ];

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
        price
      ),
      product_specifications (
        spec_key,
        value_text
      )
    `)
    .eq("status", "published")
    .in("slug", compareSlugs);

  if (error) {
    console.error("Gagal mengambil produk compare:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as CompareProductRow[];

  const normalized = rows.map((product) => {
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

  const order = new Map(compareSlugs.map((slug, index) => [slug, index]));

  return normalized.sort(
    (a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999),
  );
}
