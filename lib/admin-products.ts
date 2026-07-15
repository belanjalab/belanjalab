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

export type AdminProductSort =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "score_desc"
  | "score_asc";

export type AdminProductCompleteness =
  | "all"
  | "without_price"
  | "without_score";

export type AdminProductQuery = {
  status?: "all" | "published" | "draft";
  completeness?: AdminProductCompleteness;
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: AdminProductSort;
};

export type AdminProductPage = {
  products: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: AdminProductSort;
  completeness: AdminProductCompleteness;
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

function normalizeSort(value: string | undefined): AdminProductSort {
  const allowedSorts = new Set<AdminProductSort>([
    "newest",
    "oldest",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
    "score_desc",
    "score_asc",
  ]);

  return allowedSorts.has(value as AdminProductSort)
    ? (value as AdminProductSort)
    : "newest";
}

function normalizeCompleteness(
  value: string | undefined,
): AdminProductCompleteness {
  if (value === "without_price" || value === "without_score") {
    return value;
  }

  return "all";
}

function applyCompletenessFilter<T extends {
  is: (column: string, value: null) => T;
}>(
  request: T,
  completeness: AdminProductCompleteness,
): T {
  if (completeness === "without_price") {
    return request.is("lowest_price", null);
  }

  if (completeness === "without_score") {
    return request.is("score", null);
  }

  return request;
}

function applySort<T extends {
  order: (
    column: string,
    options?: {
      ascending?: boolean;
      nullsFirst?: boolean;
    },
  ) => T;
}>(request: T, sort: AdminProductSort): T {
  switch (sort) {
    case "oldest":
      return request.order("created_at", {
        ascending: true,
        nullsFirst: false,
      });

    case "name_asc":
      return request.order("name", {
        ascending: true,
        nullsFirst: false,
      });

    case "name_desc":
      return request.order("name", {
        ascending: false,
        nullsFirst: false,
      });

    case "price_asc":
      return request
        .order("lowest_price", {
          ascending: true,
          nullsFirst: false,
        })
        .order("name", {
          ascending: true,
          nullsFirst: false,
        });

    case "price_desc":
      return request
        .order("lowest_price", {
          ascending: false,
          nullsFirst: false,
        })
        .order("name", {
          ascending: true,
          nullsFirst: false,
        });

    case "score_asc":
      return request
        .order("score", {
          ascending: true,
          nullsFirst: false,
        })
        .order("name", {
          ascending: true,
          nullsFirst: false,
        });

    case "score_desc":
      return request
        .order("score", {
          ascending: false,
          nullsFirst: false,
        })
        .order("name", {
          ascending: true,
          nullsFirst: false,
        });

    case "newest":
    default:
      return request.order("created_at", {
        ascending: false,
        nullsFirst: false,
      });
  }
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
  const sort = normalizeSort(options.sort);
  const completeness = normalizeCompleteness(options.completeness);

  let countRequest = supabase
    .from("admin_product_catalog")
    .select("id", {
      count: "exact",
      head: true,
    });

  if (status !== "all") {
    countRequest = countRequest.eq("status", status);
  }

  countRequest = applyCompletenessFilter(
    countRequest,
    completeness,
  );

  if (query) {
    const pattern = `%${query}%`;

    countRequest = countRequest.or(
      `name.ilike.${pattern},slug.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`,
    );
  }

  const countResult = await countRequest;

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
      sort,
      completeness,
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
    .range(from, to);

  if (status !== "all") {
    dataRequest = dataRequest.eq("status", status);
  }

  dataRequest = applyCompletenessFilter(
    dataRequest,
    completeness,
  );

  if (query) {
    const pattern = `%${query}%`;

    dataRequest = dataRequest.or(
      `name.ilike.${pattern},slug.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`,
    );
  }

  dataRequest = applySort(dataRequest, sort);

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
      sort,
      completeness,
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
    sort,
    completeness,
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const result = await getAdminProductsPage({
    page: 1,
    pageSize: 50,
    sort: "newest",
    completeness: "all",
  });

  return result.products;
}
