import { createSupabaseServerClient } from "./supabase-server";

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

export type AdminProductQuery = {
  status?: "all" | "published" | "draft";
  query?: string;
  page?: number;
  pageSize?: number;
};

export type AdminProductPage = {
  products: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type AdminProductCatalogRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  image_url: string | null;
  created_at: string | null;
  category: string | null;
  brand: string | null;
  score: number | string | null;
  lowest_price: number | string | null;
};

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

function normalizeSearchQuery(value: string | undefined) {
  return (value ?? "")
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function getAdminProductsPage(
  options: AdminProductQuery = {},
): Promise<AdminProductPage> {
  const supabase = await createSupabaseServerClient();

  const pageSize = Math.min(
    50,
    Math.max(1, Math.floor(options.pageSize ?? 10)),
  );

  const requestedPage = Math.max(
    1,
    Math.floor(options.page ?? 1),
  );

  const status =
    options.status === "published" || options.status === "draft"
      ? options.status
      : "all";

  const query = normalizeSearchQuery(options.query);

  let request = supabase
    .from("admin_product_catalog")
    .select(
      `
        id,
        name,
        slug,
        status,
        image_url,
        created_at,
        category,
        brand,
        score,
        lowest_price
      `,
      {
        count: "exact",
      },
    );

  if (status !== "all") {
    request = request.eq("status", status);
  }

  if (query) {
    const pattern = `%${query}%`;

    request = request.or(
      `name.ilike.${pattern},slug.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`,
    );
  }

  const countResult = await request.range(0, 0);

  if (countResult.error) {
    console.error(
      "Gagal menghitung daftar produk admin:",
      countResult.error.message,
    );

    return {
      products: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  const total = countResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let dataRequest = supabase
    .from("admin_product_catalog")
    .select(`
      id,
      name,
      slug,
      status,
      image_url,
      created_at,
      category,
      brand,
      score,
      lowest_price
    `)
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    })
    .range(from, to);

  if (status !== "all") {
    dataRequest = dataRequest.eq("status", status);
  }

  if (query) {
    const pattern = `%${query}%`;

    dataRequest = dataRequest.or(
      `name.ilike.${pattern},slug.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`,
    );
  }

  const { data, error } = await dataRequest;

  if (error) {
    console.error(
      "Gagal mengambil daftar produk admin:",
      error.message,
    );

    return {
      products: [],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  const rows = (data ?? []) as AdminProductCatalogRow[];

  const products = rows.map((product) => {
    const numericScore =
      product.score !== null && product.score !== undefined
        ? Number(product.score)
        : null;

    const numericPrice =
      product.lowest_price !== null &&
      product.lowest_price !== undefined
        ? Number(product.lowest_price)
        : null;

    const score =
      numericScore !== null && Number.isFinite(numericScore)
        ? numericScore
        : null;

    const lowestPrice =
      numericPrice !== null && Number.isFinite(numericPrice)
        ? numericPrice
        : null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      imageUrl:
        product.image_url ?? "/images/products/logitech-g102.png",
      category: product.category ?? "Tanpa kategori",
      brand: product.brand ?? "Tanpa merek",
      score,
      lowestPrice,
      formattedPrice: formatRupiah(lowestPrice),
      createdAt: product.created_at,
    };
  });

  return {
    products,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const result = await getAdminProductsPage({
    page: 1,
    pageSize: 50,
  });

  return result.products;
}
