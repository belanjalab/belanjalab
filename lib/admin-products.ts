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

type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  image_url: string | null;
  created_at: string | null;
  categories?: CategoryRelation | CategoryRelation[] | null;
  brands?: BrandRelation | BrandRelation[] | null;
  product_scores?: ScoreRelation | ScoreRelation[] | null;
  product_prices?: PriceRelation[] | null;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  status: string;
  imageUrl: string;
  category: string;
  brand: string;
  score: number | null;
  lowestPrice: number | null;
  formattedPrice: string;
  createdAt: string | null;
};

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
    return "Belum ada harga";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
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
      status,
      image_url,
      created_at,
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil daftar produk admin:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as AdminProductRow[];

  return rows.map((product) => {
    const category = getSingleRelation(product.categories);
    const brand = getSingleRelation(product.brands);
    const scoreRelation = getSingleRelation(product.product_scores);
    const lowestPrice = getLowestPrice(product.product_prices);

    const numericScore =
      scoreRelation?.overall_score !== null &&
      scoreRelation?.overall_score !== undefined
        ? Number(scoreRelation.overall_score)
        : null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      imageUrl:
        product.image_url ?? "/images/products/logitech-g102.png",
      category: category?.name ?? "Tanpa kategori",
      brand: brand?.name ?? "Tanpa merek",
      score:
        numericScore !== null && Number.isFinite(numericScore)
          ? numericScore
          : null,
      lowestPrice,
      formattedPrice: formatRupiah(lowestPrice),
      createdAt: product.created_at,
    };
  });
}
