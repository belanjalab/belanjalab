import { createSupabaseServerClient } from "./supabase-server";

type CategoryRelation = {
  id: string;
  name: string;
};

type BrandRelation = {
  id: string;
  name: string;
};

type ScoreRelation = {
  performance: number | string | null;
  design: number | string | null;
  features: number | string | null;
  value: number | string | null;
  ease_of_use: number | string | null;
  overall_score: number | string | null;
};

type MarketplaceRelation = {
  id: string;
  name: string;
};

type PriceRelation = {
  id: string;
  marketplace_id: string;
  price: number | string | null;
  affiliate_url: string | null;
  marketplaces?: MarketplaceRelation | MarketplaceRelation[] | null;
};

type AdminProductEditRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  category_id: string;
  brand_id: string;
  is_featured: boolean;
  featured_order: number | null;
  categories?: CategoryRelation | CategoryRelation[] | null;
  brands?: BrandRelation | BrandRelation[] | null;
  product_scores?: ScoreRelation | ScoreRelation[] | null;
  product_prices?: PriceRelation[] | null;
};

export type AdminProductEditData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  status: string;
  categoryId: string;
  brandId: string;
  isFeatured: boolean;
  featuredOrder: number | null;
  performance: number;
  design: number;
  features: number;
  value: number;
  easeOfUse: number;
  overallScore: number;
  priceId: string | null;
  marketplaceId: string;
  marketplaceName: string;
  price: number;
  affiliateUrl: string;
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

export async function getAdminProductForEdit(
  productId: string,
): Promise<AdminProductEditData | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      image_url,
      status,
      category_id,
      brand_id,
      is_featured,
      featured_order,
      categories (
        id,
        name
      ),
      brands (
        id,
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
        id,
        marketplace_id,
        price,
        affiliate_url,
        marketplaces (
          id,
          name
        )
      )
    `)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil produk untuk diedit:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const product = data as unknown as AdminProductEditRow;
  const score = getSingleRelation(product.product_scores);
  const firstPrice = product.product_prices?.[0] ?? null;
  const marketplace = getSingleRelation(firstPrice?.marketplaces);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.short_description ?? "",
    description: product.description ?? "",
    imageUrl:
      product.image_url ?? "/images/products/logitech-g102.png",
    status: product.status,
    categoryId: product.category_id,
    brandId: product.brand_id,
    isFeatured: product.is_featured,
    featuredOrder: product.featured_order,
    performance: toNumber(score?.performance),
    design: toNumber(score?.design),
    features: toNumber(score?.features),
    value: toNumber(score?.value),
    easeOfUse: toNumber(score?.ease_of_use),
    overallScore: toNumber(score?.overall_score),
    priceId: firstPrice?.id ?? null,
    marketplaceId: firstPrice?.marketplace_id ?? "",
    marketplaceName: marketplace?.name ?? "",
    price: toNumber(firstPrice?.price),
    affiliateUrl: firstPrice?.affiliate_url ?? "",
  };
}
