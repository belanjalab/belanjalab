import {
  getCategoryLandingData,
  type CategoryLandingData,
} from "@/lib/categories";

export type RecommendationDefinition = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords: string[];
  intro: string[];
  criteria: string[];
  relatedLabel: string;
};

export type RecommendationLandingData = {
  recommendation: RecommendationDefinition;
  categoryData: CategoryLandingData;
};

const recommendationPages: RecommendationDefinition[] = [
  {
    slug: "hp-terbaik",
    eyebrow: "Pilihan BelanjaLab",
    title: "HP Terbaik",
    description:
      "Temukan rekomendasi HP terbaik berdasarkan skor BelanjaLab, performa, fitur, value, dan harga marketplace yang tersedia.",
    categorySlug: "gadget",
    subcategory: "smartphone",
    keywords: [
      "hp terbaik",
      "smartphone terbaik",
      "rekomendasi hp",
      "hp terbaik indonesia",
    ],
    intro: [
      "HP terbaik tidak selalu berarti model paling mahal. Pilihan yang tepat adalah perangkat yang paling seimbang untuk kebutuhan, anggaran, performa, kamera, baterai, dan masa pemakaian.",
      "BelanjaLab menyusun daftar ini dari produk published yang tersedia di database lalu mengurutkannya berdasarkan skor produk. Harga marketplace digunakan sebagai referensi tambahan agar kamu bisa menilai value sebelum membeli.",
    ],
    criteria: [
      "Skor performa, fitur, desain, value, dan kemudahan penggunaan.",
      "Harga marketplace yang tersedia dan masih aktif.",
      "Kesesuaian spesifikasi untuk kebutuhan penggunaan sehari-hari.",
    ],
    relatedLabel: "Smartphone",
  },
  {
    slug: "hp-3-jutaan",
    eyebrow: "Pilihan Berdasarkan Budget",
    title: "HP 3 Jutaan Terbaik",
    description:
      "Rekomendasi HP harga 3 jutaan terbaik dengan skor, fitur, dan value yang layak dipertimbangkan sebelum membeli.",
    categorySlug: "gadget",
    subcategory: "smartphone",
    minPrice: 3_000_000,
    maxPrice: 3_999_999,
    keywords: [
      "hp 3 jutaan terbaik",
      "hp harga 3 jutaan",
      "smartphone 3 jutaan",
      "rekomendasi hp 3 juta",
    ],
    intro: [
      "Kelas harga 3 jutaan biasanya menawarkan keseimbangan yang menarik antara performa, layar, kamera, baterai, dan fitur tanpa harus masuk ke kelas flagship.",
      "Daftar ini hanya menampilkan produk dengan harga marketplace mulai dari Rp3 juta sampai di bawah Rp4 juta pada data BelanjaLab yang tersedia.",
    ],
    criteria: [
      "Harga terendah yang tersedia berada di rentang Rp3.000.000–Rp3.999.999.",
      "Skor produk digunakan untuk memprioritaskan pilihan yang lebih seimbang.",
      "Value tetap dipertimbangkan, bukan hanya spesifikasi tertinggi.",
    ],
    relatedLabel: "HP 3 jutaan",
  },
  {
    slug: "hp-5-jutaan",
    eyebrow: "Pilihan Berdasarkan Budget",
    title: "HP 5 Jutaan Terbaik",
    description:
      "Bandingkan HP 5 jutaan terbaik berdasarkan skor BelanjaLab, fitur, performa, kamera, dan harga marketplace.",
    categorySlug: "gadget",
    subcategory: "smartphone",
    minPrice: 5_000_000,
    maxPrice: 5_999_999,
    keywords: [
      "hp 5 jutaan terbaik",
      "hp harga 5 jutaan",
      "smartphone 5 jutaan",
      "rekomendasi hp 5 juta",
    ],
    intro: [
      "Di kisaran 5 jutaan, pengguna biasanya mulai mendapatkan layar, kamera, material, dan performa yang lebih matang dibanding kelas entry-level.",
      "BelanjaLab menyaring produk berdasarkan harga terendah yang tersedia di rentang Rp5 juta sampai di bawah Rp6 juta lalu mengurutkannya berdasarkan skor.",
    ],
    criteria: [
      "Harga terendah yang tersedia berada di rentang Rp5.000.000–Rp5.999.999.",
      "Skor produk dipakai untuk membantu melihat kualitas keseluruhan.",
      "Fitur dan value dibandingkan agar selisih harga tetap masuk akal.",
    ],
    relatedLabel: "HP 5 jutaan",
  },
  {
    slug: "gadget-terbaik",
    eyebrow: "Pilihan BelanjaLab",
    title: "Gadget Terbaik",
    description:
      "Temukan gadget terbaik berdasarkan skor, fitur, value, dan harga marketplace, mulai dari smartphone sampai wearable.",
    categorySlug: "gadget",
    keywords: [
      "gadget terbaik",
      "rekomendasi gadget",
      "produk gadget terbaik",
      "gadget terbaru",
    ],
    intro: [
      "Kategori gadget mencakup perangkat yang dipakai sehari-hari seperti smartphone, tablet, smartwatch, earbuds, dan aksesori pintar.",
      "Daftar ini membantu melihat produk dengan skor terbaik di kategori Gadget sehingga kamu bisa mulai dari pilihan yang paling kuat sebelum membandingkan spesifikasi lebih detail.",
    ],
    criteria: [
      "Skor keseluruhan produk menjadi dasar pengurutan utama.",
      "Harga marketplace membantu melihat apakah skor sebanding dengan biaya.",
      "Produk harus berstatus published agar masuk dalam rekomendasi.",
    ],
    relatedLabel: "Gadget",
  },
  {
    slug: "gaming-terbaik",
    eyebrow: "Pilihan BelanjaLab",
    title: "Perangkat Gaming Terbaik",
    description:
      "Cari perangkat gaming terbaik berdasarkan performa, fitur, kenyamanan, skor BelanjaLab, dan harga marketplace.",
    categorySlug: "gaming",
    keywords: [
      "gaming terbaik",
      "perangkat gaming terbaik",
      "rekomendasi gaming",
      "aksesoris gaming terbaik",
    ],
    intro: [
      "Perangkat gaming yang cocok bergantung pada jenis permainan, setup, kenyamanan, latency, dan fitur yang benar-benar digunakan.",
      "BelanjaLab mengurutkan produk Gaming berdasarkan skor agar mouse, keyboard, headset, monitor, dan perangkat lain lebih mudah dibandingkan dari satu titik awal.",
    ],
    criteria: [
      "Performa dan pengalaman penggunaan menjadi faktor utama.",
      "Fitur dinilai bersama kenyamanan dan kompatibilitas.",
      "Value membantu membedakan fitur penting dari fitur yang sekadar menambah harga.",
    ],
    relatedLabel: "Gaming",
  },
  {
    slug: "elektronik-terbaik",
    eyebrow: "Pilihan BelanjaLab",
    title: "Elektronik Terbaik",
    description:
      "Bandingkan produk elektronik terbaik berdasarkan fitur, skor, value, kebutuhan penggunaan, dan harga marketplace.",
    categorySlug: "elektronik",
    keywords: [
      "elektronik terbaik",
      "rekomendasi elektronik",
      "produk elektronik terbaik",
      "elektronik rumah terbaik",
    ],
    intro: [
      "Produk elektronik sering memiliki fitur yang terlihat mirip tetapi berbeda pada kualitas panel, konektivitas, konsumsi daya, software, dan dukungan purna jual.",
      "Daftar ini menempatkan produk dengan skor terbaik lebih dulu agar proses membandingkan elektronik menjadi lebih terarah.",
    ],
    criteria: [
      "Skor keseluruhan dan fitur digunakan sebagai referensi utama.",
      "Harga marketplace digunakan untuk menilai value.",
      "Produk published dengan data yang tersedia diprioritaskan.",
    ],
    relatedLabel: "Elektronik",
  },
  {
    slug: "rumah-tangga-terbaik",
    eyebrow: "Pilihan BelanjaLab",
    title: "Kebutuhan Rumah Tangga Terbaik",
    description:
      "Temukan kebutuhan rumah tangga terbaik berdasarkan fungsi, kemudahan penggunaan, value, skor, dan harga marketplace.",
    categorySlug: "rumah-tangga",
    keywords: [
      "kebutuhan rumah tangga terbaik",
      "peralatan rumah tangga terbaik",
      "rekomendasi rumah tangga",
      "alat rumah tangga terbaik",
    ],
    intro: [
      "Peralatan rumah tangga yang baik bukan hanya memiliki banyak fitur, tetapi benar-benar membuat aktivitas rutin lebih mudah, hemat waktu, dan efisien.",
      "BelanjaLab mengurutkan pilihan berdasarkan skor produk agar kamu bisa membandingkan fungsi, kemudahan penggunaan, dan value sebelum melihat harga marketplace.",
    ],
    criteria: [
      "Kemudahan penggunaan dan fungsi praktis menjadi pertimbangan penting.",
      "Skor keseluruhan digunakan untuk mengurutkan produk.",
      "Harga marketplace membantu melihat keseimbangan manfaat dan biaya.",
    ],
    relatedLabel: "Rumah Tangga",
  },
];

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

export function getAllRecommendationPages() {
  return recommendationPages;
}

export function getRecommendationBySlug(slug: string) {
  const cleanSlug = normalizeSlug(slug);
  return recommendationPages.find((page) => page.slug === cleanSlug) ?? null;
}

export function getRecommendationPagesForCategory(categorySlug: string) {
  const cleanSlug = normalizeSlug(categorySlug);
  return recommendationPages.filter(
    (page) => page.categorySlug === cleanSlug,
  );
}

export async function getRecommendationLandingData(
  slug: string,
  requestedPage = 1,
  pageSize = 24,
): Promise<RecommendationLandingData | null> {
  const recommendation = getRecommendationBySlug(slug);

  if (!recommendation) {
    return null;
  }

  const categoryData = await getCategoryLandingData(
    recommendation.categorySlug,
    requestedPage,
    pageSize,
    {
      sort: "score-desc",
      subcategory: recommendation.subcategory ?? null,
      minPrice: recommendation.minPrice ?? null,
      maxPrice: recommendation.maxPrice ?? null,
    },
  );

  if (!categoryData) {
    return null;
  }

  return {
    recommendation,
    categoryData,
  };
}
