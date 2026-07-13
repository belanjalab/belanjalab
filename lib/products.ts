import { getSupabaseClient } from "./supabase";

export type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: string;
  score: string;
  price: string;
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
    .limit(6);

  if (error) {
    console.error("Gagal mengambil produk:", error.message);
    return [];
  }

  return (data ?? []).map((product) => {
    const prices = product.product_prices ?? [];

    const numericPrices = prices
      .map((item) => Number(item.price))
      .filter((price) => Number.isFinite(price));

    const lowestPrice =
      numericPrices.length > 0 ? Math.min(...numericPrices) : null;

    const score = product.product_scores?.[0]?.overall_score;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl:
        product.image_url ?? "/images/products/logitech-g102.png",
      category: product.categories?.[0]?.name ?? "Produk",
      score: score
        ? `${Number(score).toFixed(1)}/10`
        : "Belum dinilai",
      price: formatRupiah(lowestPrice),
    };
  });
}

export async function getProductBySlug(slug: string) {
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

  return data;
}
