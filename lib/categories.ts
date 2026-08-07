import { getSafeImageUrl } from "./site-config";
import { getSupabaseClient } from "./supabase";

type Relation<T> = T | T[] | null | undefined;

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  created_at?: string | null;
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

type CategoryProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  brands?: Relation<BrandRelation>;
  product_scores?: Relation<ScoreRelation>;
  product_prices?: PriceRelation[] | null;
};

export type HomepageCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export type PublicCategory = HomepageCategory & {
  createdAt: string | null;
};

export type CategoryProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  brand: string;
  score: number | null;
  lowestPrice: number | null;
  formattedPrice: string;
};

export type CategoryLandingData = {
  category: PublicCategory;
  products: CategoryProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CategorySeoProfile = {
  eyebrow: string;
  titlePrefix: string;
  description: string;
  paragraphs: string[];
  popularSearches: string[];
  buyingTips: string[];
};

const categoryIcons: Record<string, string> = {
  gadget: "📱",
  elektronik: "💻",
  "rumah-tangga": "🏠",
  rumah: "🏠",
  gaming: "🎮",
  beauty: "🧴",
  fashion: "👕",
  otomotif: "🚗",
  olahraga: "🏃",
  kesehatan: "🩺",
  dapur: "🍳",
};

const categorySeoProfiles: Record<string, CategorySeoProfile> = {
  gadget: {
    eyebrow: "Panduan Gadget",
    titlePrefix: "Rekomendasi Gadget Terbaik",
    description:
      "Temukan rekomendasi gadget terbaik, skor produk, spesifikasi, dan perbandingan harga dari berbagai marketplace di BelanjaLab.",
    paragraphs: [
      "Gadget berkembang cepat dan pilihan produknya semakin banyak. BelanjaLab membantu kamu menyaring pilihan berdasarkan skor, spesifikasi, harga, dan kebutuhan penggunaan agar keputusan belanja lebih mudah dipertanggungjawabkan.",
      "Bandingkan smartphone, tablet, smartwatch, earbuds, dan perangkat pintar lainnya. Setiap produk dapat dilihat bersama skor BelanjaLab serta harga marketplace yang tersedia sehingga kamu tidak hanya memilih berdasarkan popularitas.",
    ],
    popularSearches: ["Smartphone", "Tablet", "Smartwatch", "Earbuds"],
    buyingTips: [
      "Sesuaikan performa dengan aplikasi dan aktivitas harian.",
      "Periksa kapasitas baterai, layar, kamera, dan masa dukungan software.",
      "Bandingkan harga dan skor value sebelum menentukan pilihan.",
    ],
  },
  elektronik: {
    eyebrow: "Panduan Elektronik",
    titlePrefix: "Rekomendasi Elektronik Terbaik",
    description:
      "Bandingkan produk elektronik terbaik berdasarkan fitur, skor, kebutuhan, dan harga marketplace melalui BelanjaLab.",
    paragraphs: [
      "Produk elektronik memiliki perbedaan fitur yang sering sulit dibandingkan hanya dari harga. BelanjaLab merangkum informasi utama agar kamu lebih mudah melihat produk yang sesuai dengan kebutuhan dan anggaran.",
      "Gunakan halaman ini untuk menjelajahi perangkat elektronik, membandingkan skor, dan melihat pilihan harga yang tersedia sebelum membeli.",
    ],
    popularSearches: ["TV", "Monitor", "Speaker", "Kamera"],
    buyingTips: [
      "Tentukan fitur yang benar-benar dibutuhkan sebelum membandingkan harga.",
      "Perhatikan konsumsi daya, garansi, dan kompatibilitas perangkat.",
      "Utamakan produk dengan kombinasi fitur dan value yang seimbang.",
    ],
  },
  "rumah-tangga": {
    eyebrow: "Panduan Rumah Tangga",
    titlePrefix: "Rekomendasi Kebutuhan Rumah Tangga Terbaik",
    description:
      "Cari kebutuhan rumah tangga terbaik, mulai dari peralatan dapur sampai perangkat kebersihan, lengkap dengan skor dan perbandingan harga.",
    paragraphs: [
      "Peralatan rumah tangga seharusnya membuat aktivitas sehari-hari lebih praktis. BelanjaLab membantu membandingkan fungsi, kemudahan penggunaan, value, dan harga agar produk yang dipilih benar-benar berguna dalam jangka panjang.",
      "Jelajahi pilihan produk rumah tangga dan gunakan skor BelanjaLab sebagai salah satu referensi sebelum membeli di marketplace pilihanmu.",
    ],
    popularSearches: ["Air Fryer", "Vacuum Cleaner", "Rice Cooker", "Blender"],
    buyingTips: [
      "Sesuaikan kapasitas produk dengan jumlah pengguna di rumah.",
      "Periksa kemudahan perawatan dan ketersediaan suku cadang.",
      "Bandingkan biaya, daya listrik, fitur, dan durabilitas.",
    ],
  },
  gaming: {
    eyebrow: "Panduan Gaming",
    titlePrefix: "Rekomendasi Perangkat Gaming Terbaik",
    description:
      "Temukan mouse, keyboard, headset, monitor, dan perangkat gaming terbaik berdasarkan performa, fitur, skor, serta harga.",
    paragraphs: [
      "Perangkat gaming yang tepat bergantung pada jenis game, gaya bermain, dan setup yang digunakan. BelanjaLab membantu membandingkan performa, desain, fitur, value, dan kemudahan penggunaan dalam satu tempat.",
      "Mulai dari peripheral terjangkau sampai perangkat kelas premium, gunakan skor dan perbandingan harga untuk menemukan pilihan yang paling sesuai dengan kebutuhan gaming kamu.",
    ],
    popularSearches: [
      "Mouse Gaming",
      "Keyboard Gaming",
      "Headset Gaming",
      "Monitor Gaming",
    ],
    buyingTips: [
      "Prioritaskan performa dan kenyamanan sesuai jenis game yang dimainkan.",
      "Perhatikan konektivitas, latency, ukuran, dan kompatibilitas.",
      "Bandingkan fitur yang benar-benar digunakan dengan selisih harganya.",
    ],
  },
};

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryIcon(name: string, slug?: string) {
  const slugKey = normalizeKey(slug ?? "");
  const nameKey = normalizeKey(name);

  return categoryIcons[slugKey] ?? categoryIcons[nameKey] ?? "🛍️";
}

function getSingleRelation<T>(relation: Relation<T>): T | null {
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

function mapCategory(row: CategoryRow): PublicCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: getCategoryIcon(row.name, row.slug),
    createdAt: row.created_at ?? null,
  };
}

function mapCategoryProduct(product: CategoryProductRow): CategoryProduct {
  const brand = getSingleRelation(product.brands);
  const scoreRelation = getSingleRelation(product.product_scores);
  const scoreValue = Number(scoreRelation?.overall_score);
  const lowestPrice = getLowestPrice(product.product_prices);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription:
      product.short_description ?? "Deskripsi produk belum tersedia.",
    imageUrl: getSafeImageUrl(product.image_url),
    brand: brand?.name ?? "Tanpa merek",
    score: Number.isFinite(scoreValue) ? scoreValue : null,
    lowestPrice,
    formattedPrice: formatRupiah(lowestPrice),
  };
}

export function getCategorySeoProfile(
  category: Pick<PublicCategory, "name" | "slug">,
): CategorySeoProfile {
  const key = normalizeKey(category.slug || category.name);
  const predefined = categorySeoProfiles[key];

  if (predefined) {
    return predefined;
  }

  return {
    eyebrow: `Panduan ${category.name}`,
    titlePrefix: `Rekomendasi ${category.name} Terbaik`,
    description: `Temukan rekomendasi ${category.name}, skor produk, dan perbandingan harga dari berbagai marketplace di BelanjaLab.`,
    paragraphs: [
      `BelanjaLab membantu kamu menjelajahi produk ${category.name} dengan informasi yang lebih terstruktur. Bandingkan skor, ringkasan produk, dan harga yang tersedia sebelum menentukan pilihan.`,
      `Gunakan daftar produk di halaman ini sebagai titik awal untuk menemukan pilihan ${category.name} yang sesuai dengan kebutuhan dan anggaranmu.`,
    ],
    popularSearches: [],
    buyingTips: [
      "Tentukan kebutuhan utama sebelum membandingkan produk.",
      "Perhatikan fitur, kualitas, dan kemudahan penggunaan.",
      "Bandingkan skor dan harga sebelum membeli.",
    ],
  };
}

export async function getHomepageCategories(): Promise<HomepageCategory[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .order("name", { ascending: true })
    .limit(5);

  if (error) {
    console.error("Gagal mengambil kategori Homepage:", error.message);
    return [];
  }

  return ((data ?? []) as CategoryRow[]).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: getCategoryIcon(category.name, category.slug),
  }));
}

export async function getAllPublicCategories(): Promise<PublicCategory[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil kategori:", error.message);
    return [];
  }

  return ((data ?? []) as CategoryRow[]).map(mapCategory);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<PublicCategory | null> {
  const cleanSlug = slug.trim().toLowerCase().slice(0, 120);

  if (!cleanSlug) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,created_at")
    .eq("slug", cleanSlug)
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil kategori:", error.message);
    return null;
  }

  return data ? mapCategory(data as CategoryRow) : null;
}

export async function getCategoryLandingData(
  slug: string,
  requestedPage = 1,
  pageSize = 24,
): Promise<CategoryLandingData | null> {
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  const safePageSize = Math.min(Math.max(Math.trunc(pageSize), 1), 48);
  const safePage = Math.max(Math.trunc(requestedPage), 1);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const supabase = getSupabaseClient();

  const { data, error, count } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        short_description,
        image_url,
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
      `,
      { count: "exact" },
    )
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("is_featured", { ascending: false })
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(
      `Gagal mengambil produk kategori ${category.name}:`,
      error.message,
    );

    return {
      category,
      products: [],
      total: 0,
      page: safePage,
      pageSize: safePageSize,
      totalPages: 1,
    };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  return {
    category,
    products: ((data ?? []) as unknown as CategoryProductRow[]).map(
      mapCategoryProduct,
    ),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}
