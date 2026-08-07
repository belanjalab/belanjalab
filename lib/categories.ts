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
  slug?: string | null;
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
  created_at?: string | null;
  brands?: Relation<BrandRelation>;
  product_scores?: Relation<ScoreRelation>;
  product_prices?: PriceRelation[] | null;
};

export type CategoryIconKey = string;

export type HomepageCategory = {
  id: string;
  name: string;
  slug: string;
  icon: CategoryIconKey;
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
  createdAt: string | null;
};

export type CategorySort =
  | "recommended"
  | "score-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

export type CategoryBrowseFilters = {
  brand?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: CategorySort | null;
  subcategory?: string | null;
};

export type CategoryBrandOption = {
  name: string;
  slug: string;
  count: number;
};

export type CategorySubcategory = {
  slug: string;
  name: string;
  keywords: string[];
  profile: CategorySeoProfile;
};

export type CategorySubcategoryOption = CategorySubcategory & {
  count: number;
};

export type CategoryLandingData = {
  category: PublicCategory;
  products: CategoryProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  brands: CategoryBrandOption[];
  subcategories: CategorySubcategoryOption[];
  activeFilters: {
    brand: string;
    minPrice: number | null;
    maxPrice: number | null;
    sort: CategorySort;
    subcategory: string;
  };
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

const categorySubcategories: Record<string, CategorySubcategory[]> = {
  gadget: [
    {
      slug: "smartphone",
      name: "Smartphone",
      keywords: ["smartphone", "galaxy a", "galaxy s", "galaxy z", "iphone", "phone"],
      profile: {
        eyebrow: "Panduan Smartphone",
        titlePrefix: "Rekomendasi Smartphone Terbaik",
        description:
          "Bandingkan smartphone terbaik berdasarkan performa, kamera, baterai, fitur, skor, dan harga marketplace di BelanjaLab.",
        paragraphs: [
          "Smartphone terbaik bukan selalu yang paling mahal. Pilihan yang tepat bergantung pada performa, kamera, baterai, dukungan software, dan anggaran yang tersedia.",
          "BelanjaLab membantu membandingkan smartphone secara lebih terstruktur melalui skor produk dan harga marketplace sebelum kamu menentukan pilihan.",
        ],
        popularSearches: ["HP Samsung", "HP 5G", "Smartphone AI"],
        buyingTips: [
          "Sesuaikan chipset dan RAM dengan aplikasi yang paling sering digunakan.",
          "Periksa kualitas layar, kamera, baterai, dan lama dukungan software.",
          "Bandingkan harga dengan skor value sebelum membeli.",
        ],
      },
    },
    {
      slug: "tablet",
      name: "Tablet",
      keywords: ["tablet", "galaxy tab", "ipad"],
      profile: {
        eyebrow: "Panduan Tablet",
        titlePrefix: "Rekomendasi Tablet Terbaik",
        description:
          "Temukan tablet terbaik untuk belajar, hiburan, kerja, dan kreativitas dengan perbandingan skor serta harga.",
        paragraphs: [
          "Tablet dapat menjadi perangkat hiburan, belajar, maupun produktivitas. Ukuran layar, performa, stylus, aksesori, dan daya tahan baterai menjadi faktor penting sebelum membeli.",
          "Gunakan skor dan perbandingan harga BelanjaLab untuk melihat tablet yang paling sesuai dengan kebutuhanmu.",
        ],
        popularSearches: ["Galaxy Tab", "Tablet untuk kerja", "Tablet untuk belajar"],
        buyingTips: [
          "Pilih ukuran layar berdasarkan mobilitas dan jenis penggunaan.",
          "Periksa dukungan stylus, keyboard, dan aplikasi produktivitas.",
          "Bandingkan kapasitas penyimpanan dan harga varian yang tersedia.",
        ],
      },
    },
    {
      slug: "smartwatch",
      name: "Smartwatch",
      keywords: ["smartwatch", "smart watch", "galaxy watch", "watch"],
      profile: {
        eyebrow: "Panduan Smartwatch",
        titlePrefix: "Rekomendasi Smartwatch Terbaik",
        description:
          "Bandingkan smartwatch terbaik untuk kesehatan, olahraga, notifikasi, dan penggunaan harian berdasarkan fitur serta harga.",
        paragraphs: [
          "Smartwatch yang baik perlu nyaman dipakai, memiliki sensor yang relevan, baterai memadai, dan kompatibel dengan ponsel yang digunakan.",
          "BelanjaLab membantu melihat fitur dan value setiap smartwatch sebelum kamu membeli.",
        ],
        popularSearches: ["Galaxy Watch", "Jam pintar", "Smartwatch olahraga"],
        buyingTips: [
          "Pastikan kompatibilitas smartwatch dengan smartphone kamu.",
          "Pilih sensor kesehatan dan olahraga yang benar-benar diperlukan.",
          "Perhatikan daya tahan baterai dan kenyamanan pemakaian.",
        ],
      },
    },
    {
      slug: "earbuds",
      name: "Earbuds dan TWS",
      keywords: ["earbuds", "earbud", "buds", "tws", "true wireless"],
      profile: {
        eyebrow: "Panduan TWS",
        titlePrefix: "Rekomendasi Earbuds dan TWS Terbaik",
        description:
          "Temukan TWS dan earbuds terbaik berdasarkan kualitas suara, ANC, baterai, kenyamanan, fitur, dan harga.",
        paragraphs: [
          "Earbuds dan TWS memiliki karakter suara, kualitas mikrofon, ANC, codec, dan daya tahan baterai yang berbeda-beda.",
          "Bandingkan skor BelanjaLab dan harga marketplace untuk mencari pilihan audio nirkabel yang paling sesuai.",
        ],
        popularSearches: ["Galaxy Buds", "TWS ANC", "Earbuds murah"],
        buyingTips: [
          "Perhatikan kenyamanan dan ukuran eartips untuk penggunaan lama.",
          "Bandingkan kualitas mikrofon, ANC, dan daya tahan baterai.",
          "Cek fitur ekosistem yang hanya aktif pada perangkat tertentu.",
        ],
      },
    },
  ],
  elektronik: [
    {
      slug: "tv",
      name: "TV",
      keywords: ["tv", "television", "televisi", "smart tv"],
      profile: {
        eyebrow: "Panduan TV",
        titlePrefix: "Rekomendasi TV Terbaik",
        description: "Bandingkan TV terbaik berdasarkan kualitas gambar, fitur pintar, ukuran, dan harga.",
        paragraphs: [
          "Memilih TV perlu mempertimbangkan ukuran ruangan, panel, resolusi, refresh rate, sistem operasi, dan konektivitas.",
          "BelanjaLab membantu membandingkan fitur dan value TV sebelum kamu membeli.",
        ],
        popularSearches: ["Smart TV", "TV 4K", "TV untuk gaming"],
        buyingTips: [
          "Sesuaikan ukuran layar dengan jarak menonton.",
          "Periksa jenis panel, resolusi, HDR, dan refresh rate.",
          "Bandingkan sistem operasi, port, garansi, dan harga.",
        ],
      },
    },
    {
      slug: "monitor",
      name: "Monitor",
      keywords: ["monitor", "display"],
      profile: {
        eyebrow: "Panduan Monitor",
        titlePrefix: "Rekomendasi Monitor Terbaik",
        description: "Temukan monitor terbaik untuk kerja, desain, hiburan, dan gaming berdasarkan spesifikasi serta harga.",
        paragraphs: [
          "Monitor perlu dipilih berdasarkan resolusi, ukuran, panel, refresh rate, akurasi warna, dan konektivitas.",
          "Bandingkan skor dan harga untuk menemukan monitor yang paling sesuai dengan kebutuhanmu.",
        ],
        popularSearches: ["Monitor kerja", "Monitor 144Hz", "Monitor 4K"],
        buyingTips: [
          "Pilih resolusi dan ukuran sesuai jarak kerja.",
          "Periksa panel, refresh rate, dan akurasi warna.",
          "Pastikan port sesuai dengan laptop atau PC yang digunakan.",
        ],
      },
    },
    {
      slug: "speaker",
      name: "Speaker dan Soundbar",
      keywords: ["speaker", "soundbar", "audio"],
      profile: {
        eyebrow: "Panduan Audio",
        titlePrefix: "Rekomendasi Speaker dan Soundbar Terbaik",
        description: "Bandingkan speaker dan soundbar berdasarkan kualitas audio, konektivitas, fitur, dan harga.",
        paragraphs: [
          "Perangkat audio yang tepat bergantung pada ukuran ruangan, jenis konten, koneksi, dan karakter suara yang diinginkan.",
          "Gunakan BelanjaLab untuk membandingkan fitur dan value sebelum memilih speaker atau soundbar.",
        ],
        popularSearches: ["Soundbar", "Bluetooth speaker", "Speaker TV"],
        buyingTips: [
          "Sesuaikan output dan ukuran perangkat dengan ruangan.",
          "Periksa Bluetooth, HDMI ARC, optical, dan koneksi lain.",
          "Bandingkan fitur dengan harga, bukan daya keluaran saja.",
        ],
      },
    },
  ],
  "rumah-tangga": [
    {
      slug: "air-fryer",
      name: "Air Fryer",
      keywords: ["air fryer", "airfryer"],
      profile: {
        eyebrow: "Panduan Air Fryer",
        titlePrefix: "Rekomendasi Air Fryer Terbaik",
        description: "Temukan air fryer terbaik berdasarkan kapasitas, daya, fitur, kemudahan perawatan, dan harga.",
        paragraphs: [
          "Air fryer perlu disesuaikan dengan jumlah pengguna, kapasitas keranjang, daya listrik, dan kemudahan pembersihan.",
          "BelanjaLab membantu membandingkan pilihan air fryer secara lebih praktis sebelum membeli.",
        ],
        popularSearches: ["Air fryer murah", "Air fryer besar", "Air fryer hemat listrik"],
        buyingTips: [
          "Pilih kapasitas sesuai jumlah anggota rumah.",
          "Perhatikan daya listrik dan rentang suhu.",
          "Cari desain keranjang yang mudah dibersihkan.",
        ],
      },
    },
    {
      slug: "vacuum-cleaner",
      name: "Vacuum Cleaner",
      keywords: ["vacuum", "vacuum cleaner", "robot vacuum"],
      profile: {
        eyebrow: "Panduan Vacuum Cleaner",
        titlePrefix: "Rekomendasi Vacuum Cleaner Terbaik",
        description: "Bandingkan vacuum cleaner terbaik berdasarkan daya hisap, baterai, fitur, aksesori, dan harga.",
        paragraphs: [
          "Vacuum cleaner tersedia dalam berbagai bentuk untuk kebutuhan lantai, sofa, kendaraan, hingga pembersihan otomatis.",
          "Bandingkan fitur, kemudahan penggunaan, dan harga untuk memilih perangkat yang paling sesuai.",
        ],
        popularSearches: ["Vacuum cordless", "Robot vacuum", "Vacuum rumah"],
        buyingTips: [
          "Sesuaikan tipe vacuum dengan area yang paling sering dibersihkan.",
          "Periksa daya tahan baterai dan aksesori bawaan.",
          "Pertimbangkan biaya filter dan komponen pengganti.",
        ],
      },
    },
    {
      slug: "rice-cooker",
      name: "Rice Cooker",
      keywords: ["rice cooker", "magic com", "penanak nasi"],
      profile: {
        eyebrow: "Panduan Rice Cooker",
        titlePrefix: "Rekomendasi Rice Cooker Terbaik",
        description: "Temukan rice cooker terbaik berdasarkan kapasitas, fungsi memasak, kemudahan penggunaan, dan harga.",
        paragraphs: [
          "Rice cooker digunakan setiap hari sehingga kapasitas, kualitas panci, fungsi memasak, dan kemudahan perawatan penting diperhatikan.",
          "Gunakan BelanjaLab untuk membandingkan fitur dan value sebelum membeli.",
        ],
        popularSearches: ["Rice cooker digital", "Magic com", "Rice cooker mini"],
        buyingTips: [
          "Pilih kapasitas sesuai kebutuhan rumah.",
          "Periksa material panci dan program memasak.",
          "Pertimbangkan konsumsi daya dan kemudahan membersihkan.",
        ],
      },
    },
    {
      slug: "blender",
      name: "Blender",
      keywords: ["blender", "juicer", "food processor"],
      profile: {
        eyebrow: "Panduan Blender",
        titlePrefix: "Rekomendasi Blender Terbaik",
        description: "Bandingkan blender terbaik berdasarkan motor, kapasitas, mata pisau, fitur, dan harga.",
        paragraphs: [
          "Blender yang sesuai perlu memiliki tenaga motor, kapasitas, dan aksesori yang cocok dengan jenis bahan yang sering diolah.",
          "BelanjaLab membantu melihat perbedaan fitur serta harga sebelum menentukan pilihan.",
        ],
        popularSearches: ["Blender kaca", "Blender portable", "Blender bumbu"],
        buyingTips: [
          "Sesuaikan daya motor dengan bahan yang sering diolah.",
          "Periksa kapasitas dan material jar.",
          "Cari komponen yang mudah dilepas dan dibersihkan.",
        ],
      },
    },
  ],
  gaming: [
    {
      slug: "mouse-gaming",
      name: "Mouse Gaming",
      keywords: ["mouse gaming", "gaming mouse", "mouse"],
      profile: {
        eyebrow: "Panduan Mouse Gaming",
        titlePrefix: "Rekomendasi Mouse Gaming Terbaik",
        description: "Temukan mouse gaming terbaik berdasarkan sensor, bobot, polling rate, desain, fitur, dan harga.",
        paragraphs: [
          "Mouse gaming yang tepat bergantung pada grip, ukuran tangan, jenis game, sensor, bobot, dan konektivitas.",
          "Bandingkan skor performa serta harga untuk menemukan mouse yang paling sesuai dengan setup kamu.",
        ],
        popularSearches: ["Mouse gaming wireless", "Mouse FPS", "Mouse gaming murah"],
        buyingTips: [
          "Sesuaikan bentuk dan ukuran dengan grip serta tangan.",
          "Periksa sensor, polling rate, bobot, dan koneksi.",
          "Utamakan kenyamanan dibanding jumlah tombol yang tidak digunakan.",
        ],
      },
    },
    {
      slug: "keyboard-gaming",
      name: "Keyboard Gaming",
      keywords: ["keyboard gaming", "gaming keyboard", "mechanical keyboard", "keyboard"],
      profile: {
        eyebrow: "Panduan Keyboard Gaming",
        titlePrefix: "Rekomendasi Keyboard Gaming Terbaik",
        description: "Bandingkan keyboard gaming terbaik berdasarkan switch, layout, latency, build quality, fitur, dan harga.",
        paragraphs: [
          "Keyboard gaming berbeda pada jenis switch, layout, konektivitas, latency, dan kualitas konstruksi.",
          "BelanjaLab membantu membandingkan fitur yang relevan agar kamu tidak membayar fitur yang tidak diperlukan.",
        ],
        popularSearches: ["Keyboard mechanical", "Keyboard wireless", "Keyboard 75 persen"],
        buyingTips: [
          "Pilih layout sesuai ruang meja dan kebutuhan tombol.",
          "Bandingkan switch, latency, dan koneksi.",
          "Periksa keycap, stabilizer, software, dan garansi.",
        ],
      },
    },
    {
      slug: "headset-gaming",
      name: "Headset Gaming",
      keywords: ["headset gaming", "gaming headset", "headphone gaming", "headset"],
      profile: {
        eyebrow: "Panduan Headset Gaming",
        titlePrefix: "Rekomendasi Headset Gaming Terbaik",
        description: "Temukan headset gaming terbaik berdasarkan suara, mikrofon, kenyamanan, konektivitas, dan harga.",
        paragraphs: [
          "Headset gaming harus nyaman dipakai lama dan memiliki karakter audio serta mikrofon yang sesuai dengan game dan komunikasi tim.",
          "Bandingkan fitur, skor, dan harga sebelum menentukan pilihan.",
        ],
        popularSearches: ["Headset wireless", "Headset FPS", "Headset gaming murah"],
        buyingTips: [
          "Prioritaskan kenyamanan untuk sesi bermain yang panjang.",
          "Periksa kualitas mikrofon dan positional audio.",
          "Bandingkan wired dan wireless berdasarkan latency serta baterai.",
        ],
      },
    },
    {
      slug: "monitor-gaming",
      name: "Monitor Gaming",
      keywords: ["monitor gaming", "gaming monitor", "monitor 144", "monitor 165", "monitor 240"],
      profile: {
        eyebrow: "Panduan Monitor Gaming",
        titlePrefix: "Rekomendasi Monitor Gaming Terbaik",
        description: "Bandingkan monitor gaming terbaik berdasarkan refresh rate, response time, panel, resolusi, fitur, dan harga.",
        paragraphs: [
          "Monitor gaming perlu diseimbangkan antara refresh rate, response time, resolusi, panel, ukuran, dan kemampuan GPU yang digunakan.",
          "Gunakan BelanjaLab untuk membandingkan spesifikasi dan value sebelum membeli.",
        ],
        popularSearches: ["Monitor 144Hz", "Monitor 165Hz", "Monitor 240Hz"],
        buyingTips: [
          "Sesuaikan resolusi dan refresh rate dengan kemampuan GPU.",
          "Periksa panel, response time, adaptive sync, dan port.",
          "Pilih ukuran yang nyaman untuk jarak pandang meja.",
        ],
      },
    },
  ],
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
    createdAt: product.created_at ?? null,
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

export function getCategorySubcategories(
  category: Pick<PublicCategory, "name" | "slug">,
): CategorySubcategory[] {
  const key = normalizeKey(category.slug || category.name);
  return categorySubcategories[key] ?? [];
}

export function getCategorySubcategory(
  category: Pick<PublicCategory, "name" | "slug">,
  subcategorySlug: string,
): CategorySubcategory | null {
  const cleanSlug = normalizeKey(subcategorySlug);
  return (
    getCategorySubcategories(category).find(
      (subcategory) => subcategory.slug === cleanSlug,
    ) ?? null
  );
}

export function matchesCategorySubcategoryText(
  name: string,
  shortDescription: string | null | undefined,
  subcategory: CategorySubcategory,
) {
  const haystack = `${name} ${shortDescription ?? ""}`.toLowerCase();
  return subcategory.keywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );
}

function normalizeOptionalPrice(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.trunc(value));
}

function normalizeSort(value: CategorySort | null | undefined): CategorySort {
  const allowed = new Set<CategorySort>([
    "recommended",
    "score-desc",
    "price-asc",
    "price-desc",
    "newest",
  ]);

  return value && allowed.has(value) ? value : "recommended";
}

function sortCategoryProducts(
  products: CategoryProduct[],
  sort: CategorySort,
) {
  if (sort === "score-desc") {
    return [...products].sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
  }

  if (sort === "price-asc" || sort === "price-desc") {
    const multiplier = sort === "price-asc" ? 1 : -1;

    return [...products].sort((a, b) => {
      if (a.lowestPrice === null && b.lowestPrice === null) return 0;
      if (a.lowestPrice === null) return 1;
      if (b.lowestPrice === null) return -1;
      return (a.lowestPrice - b.lowestPrice) * multiplier;
    });
  }

  if (sort === "newest") {
    return [...products].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  return products;
}

export async function getCategoryLandingData(
  slug: string,
  requestedPage = 1,
  pageSize = 24,
  filters: CategoryBrowseFilters = {},
): Promise<CategoryLandingData | null> {
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  const safePageSize = Math.min(Math.max(Math.trunc(pageSize), 1), 48);
  const safePage = Math.max(Math.trunc(requestedPage), 1);
  const brand = normalizeKey(filters.brand ?? "");
  const minPrice = normalizeOptionalPrice(filters.minPrice);
  const maxPrice = normalizeOptionalPrice(filters.maxPrice);
  const sort = normalizeSort(filters.sort);
  const subcategorySlug = normalizeKey(filters.subcategory ?? "");
  const requestedSubcategory = subcategorySlug
    ? getCategorySubcategory(category, subcategorySlug)
    : null;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        short_description,
        image_url,
        created_at,
        brands (
          name,
          slug
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
    )
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("is_featured", { ascending: false })
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1000);

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
      brands: [],
      subcategories: [],
      activeFilters: {
        brand,
        minPrice,
        maxPrice,
        sort,
        subcategory: subcategorySlug,
      },
    };
  }

  const allProducts = ((data ?? []) as unknown as CategoryProductRow[]).map(
    mapCategoryProduct,
  );

  const configuredSubcategories = getCategorySubcategories(category);
  const subcategories = configuredSubcategories
    .map((subcategory) => ({
      ...subcategory,
      count: allProducts.filter((product) =>
        matchesCategorySubcategoryText(
          product.name,
          product.shortDescription,
          subcategory,
        ),
      ).length,
    }))
    .filter((subcategory) => subcategory.count > 0);

  let filteredProducts = requestedSubcategory
    ? allProducts.filter((product) =>
        matchesCategorySubcategoryText(
          product.name,
          product.shortDescription,
          requestedSubcategory,
        ),
      )
    : allProducts;

  const brandMap = new Map<string, CategoryBrandOption>();

  for (const product of filteredProducts) {
    const brandSlug = normalizeKey(product.brand);
    const existing = brandMap.get(brandSlug);

    if (existing) {
      existing.count += 1;
    } else if (brandSlug) {
      brandMap.set(brandSlug, {
        name: product.brand,
        slug: brandSlug,
        count: 1,
      });
    }
  }

  const brands = Array.from(brandMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "id-ID"),
  );

  if (brand) {
    filteredProducts = filteredProducts.filter(
      (product) => normalizeKey(product.brand) === brand,
    );
  }

  if (minPrice !== null) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.lowestPrice !== null && product.lowestPrice >= minPrice,
    );
  }

  if (maxPrice !== null) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.lowestPrice !== null && product.lowestPrice <= maxPrice,
    );
  }

  filteredProducts = sortCategoryProducts(filteredProducts, sort);

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safeResolvedPage = Math.min(safePage, totalPages);
  const from = (safeResolvedPage - 1) * safePageSize;
  const products = filteredProducts.slice(from, from + safePageSize);

  return {
    category,
    products,
    total,
    page: safeResolvedPage,
    pageSize: safePageSize,
    totalPages,
    brands,
    subcategories,
    activeFilters: {
      brand,
      minPrice,
      maxPrice,
      sort,
      subcategory: subcategorySlug,
    },
  };
}
