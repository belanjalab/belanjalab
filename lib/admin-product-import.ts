"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export type ProductCsvImportRow = {
  name: string;
  slug?: string;
  category: string;
  brand: string;
  short_description?: string;
  description?: string;
  image_url?: string;
  status?: string;
  performance?: string;
  design?: string;
  features?: string;
  value?: string;
  ease_of_use?: string;
  marketplace?: string;
  price?: string;
  affiliate_url?: string;
};

export type ProductCsvValidationIssue = {
  rowNumber: number;
  field: string;
  message: string;
};

export type ProductCsvValidationResult = {
  ok: boolean;
  issues: ProductCsvValidationIssue[];
};

export type ProductCsvImportResult = {
  rowNumber: number;
  name: string;
  status: "success" | "skipped" | "error";
  message: string;
};

const MAX_IMPORT_ROWS = 200;
const SCORE_FIELDS = [
  "performance",
  "design",
  "features",
  "value",
  "ease_of_use",
] as const;

type ServerSupabaseClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type AdminClientResult =
  | { ok: true; supabase: ServerSupabaseClient }
  | { ok: false; message: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function appendSlugSuffix(baseSlug: string, suffix: number) {
  const suffixText = `-${suffix}`;
  const maxBaseLength = Math.max(1, 120 - suffixText.length);
  const trimmedBase = baseSlug.slice(0, maxBaseLength).replace(/-+$/g, "");

  return `${trimmedBase || "product"}${suffixText}`;
}

function createUniqueCsvSlugs(rows: ProductCsvImportRow[]) {
  const usedSlugs = new Set<string>();

  return rows.map((row) => {
    const name = row.name?.trim() || "Tanpa nama";
    const baseSlug = slugify(row.slug?.trim() || name);

    if (!baseSlug) {
      return "";
    }

    let candidate = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(candidate)) {
      candidate = appendSlugSuffix(baseSlug, suffix);
      suffix += 1;
    }

    usedSlugs.add(candidate);
    return candidate;
  });
}

function parseScore(value: string | undefined) {
  if (!value?.trim()) {
    return 0;
  }

  const score = Number(value);
  return Number.isFinite(score)
    ? Math.min(10, Math.max(0, score))
    : 0;
}

function parsePriceInput(value: string | undefined) {
  if (!value?.trim()) {
    return 0;
  }

  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/^rp/i, "")
    .replace(/[.,](?=\d{3}(?:[.,]|$))/g, "")
    .replace(/,/g, ".");

  const price = Number(normalized);
  return Number.isFinite(price) && price > 0 ? Math.round(price) : 0;
}

function normalizeLookup(value: string) {
  return value.trim().toLocaleLowerCase("id-ID");
}

function isHttpUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidScore(value: string | undefined) {
  if (!value?.trim()) {
    return true;
  }

  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 10;
}

async function requireAdminClient(): Promise<AdminClientResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      message: "Sesi admin tidak valid. Silakan login ulang.",
    };
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return {
      ok: false,
      message:
        adminError?.message ?? "Akun ini tidak memiliki akses admin.",
    };
  }

  return { ok: true, supabase };
}

function validateCsvShape(
  rows: ProductCsvImportRow[],
): ProductCsvValidationResult | null {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      ok: false,
      issues: [
        {
          rowNumber: 0,
          field: "file",
          message: "CSV tidak memiliki data produk.",
        },
      ],
    };
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      ok: false,
      issues: [
        {
          rowNumber: 0,
          field: "file",
          message: `Maksimal ${MAX_IMPORT_ROWS} produk per proses import.`,
        },
      ],
    };
  }

  return null;
}

async function validateProductsCsvWithClient(
  rows: ProductCsvImportRow[],
  supabase: ServerSupabaseClient,
): Promise<ProductCsvValidationResult> {
  const issues: ProductCsvValidationIssue[] = [];
  const [
    { data: categoryRows, error: categoryError },
    { data: marketplaceRows, error: marketplaceError },
  ] = await Promise.all([
    supabase.from("categories").select("name"),
    supabase.from("marketplaces").select("name"),
  ]);

  const setupError = categoryError ?? marketplaceError;

  if (setupError) {
    return {
      ok: false,
      issues: [
        {
          rowNumber: 0,
          field: "database",
          message: `Validasi database gagal: ${setupError.message}`,
        },
      ],
    };
  }

  const categories = new Set(
    (categoryRows ?? []).map((item: { name: string }) => normalizeLookup(item.name)),
  );
  const marketplaces = new Set(
    (marketplaceRows ?? []).map((item: { name: string }) => normalizeLookup(item.name)),
  );
  const csvAffiliateUrls = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const name = row.name?.trim() ?? "";
    const slug = slugify(row.slug?.trim() || name);
    const category = normalizeLookup(row.category ?? "");
    const brand = normalizeLookup(row.brand ?? "");
    const marketplace = normalizeLookup(row.marketplace ?? "");
    const affiliateUrl = row.affiliate_url?.trim() ?? "";
    const rawPrice = row.price?.trim() ?? "";
    const price = parsePriceInput(row.price);
    const status = row.status?.trim().toLowerCase() ?? "";

    if (!name) {
      issues.push({ rowNumber, field: "name", message: "name wajib diisi." });
    } else if (name.length > 200) {
      issues.push({
        rowNumber,
        field: "name",
        message: "name maksimal 200 karakter.",
      });
    }

    if (!slug) {
      issues.push({ rowNumber, field: "slug", message: "slug tidak valid." });
    }

    if (!category || !categories.has(category)) {
      issues.push({
        rowNumber,
        field: "category",
        message: `Kategori "${row.category ?? ""}" tidak ditemukan.`,
      });
    }

    if (!brand) {
      issues.push({
        rowNumber,
        field: "brand",
        message: "brand wajib diisi.",
      });
    }

    if (status && status !== "draft" && status !== "published") {
      issues.push({
        rowNumber,
        field: "status",
        message: 'status hanya boleh "draft" atau "published".',
      });
    }

    SCORE_FIELDS.forEach((field) => {
      if (!isValidScore(row[field])) {
        issues.push({
          rowNumber,
          field,
          message: `${field} harus berupa angka 0-10.`,
        });
      }
    });

    if (marketplace && !marketplaces.has(marketplace)) {
      issues.push({
        rowNumber,
        field: "marketplace",
        message: `Marketplace "${row.marketplace ?? ""}" tidak ditemukan.`,
      });
    }

    if (rawPrice && price <= 0) {
      issues.push({
        rowNumber,
        field: "price",
        message: "price harus berupa angka lebih dari 0.",
      });
    }

    if (marketplace && price <= 0) {
      issues.push({
        rowNumber,
        field: "price",
        message: "price wajib lebih dari 0 jika marketplace diisi.",
      });
    }

    if (!marketplace && (rawPrice || affiliateUrl)) {
      issues.push({
        rowNumber,
        field: "marketplace",
        message: "marketplace wajib diisi jika price atau affiliate_url diisi.",
      });
    }

    if (!isHttpUrl(row.image_url ?? "")) {
      issues.push({
        rowNumber,
        field: "image_url",
        message: "image_url harus berupa URL http/https yang valid.",
      });
    }

    if (!isHttpUrl(affiliateUrl)) {
      issues.push({
        rowNumber,
        field: "affiliate_url",
        message: "affiliate_url harus berupa URL http/https yang valid.",
      });
    }

    if (affiliateUrl && csvAffiliateUrls.has(affiliateUrl)) {
      issues.push({
        rowNumber,
        field: "affiliate_url",
        message: "affiliate_url duplikat di dalam CSV.",
      });
    } else if (affiliateUrl) {
      csvAffiliateUrls.add(affiliateUrl);
    }
  });

  return { ok: issues.length === 0, issues };
}

export async function validateProductsCsv(
  rows: ProductCsvImportRow[],
): Promise<ProductCsvValidationResult> {
  const shapeError = validateCsvShape(rows);

  if (shapeError) {
    return shapeError;
  }

  const admin = await requireAdminClient();

  if (!admin.ok) {
    return {
      ok: false,
      issues: [
        {
          rowNumber: 0,
          field: "authorization",
          message: admin.message,
        },
      ],
    };
  }

  return validateProductsCsvWithClient(rows, admin.supabase);
}

export async function importProductsFromCsv(
  rows: ProductCsvImportRow[],
  fileName?: string,
): Promise<{
  ok: boolean;
  results: ProductCsvImportResult[];
  successCount: number;
  skippedCount: number;
  errorCount: number;
  runId?: string;
}> {
  const shapeError = validateCsvShape(rows);

  if (shapeError) {
    const results = shapeError.issues.map((issue) => ({
      rowNumber: issue.rowNumber,
      name: "File CSV",
      status: "error" as const,
      message: issue.message,
    }));

    return {
      ok: false,
      results,
      successCount: 0,
      skippedCount: 0,
      errorCount: results.length,
    };
  }

  const admin = await requireAdminClient();

  if (!admin.ok) {
    return {
      ok: false,
      results: [
        {
          rowNumber: 0,
          name: "Akses admin",
          status: "error",
          message: admin.message,
        },
      ],
      successCount: 0,
      skippedCount: 0,
      errorCount: 1,
    };
  }

  const { supabase } = admin;
  const validation = await validateProductsCsvWithClient(rows, supabase);

  if (!validation.ok) {
    const validationResults = validation.issues.map((issue) => ({
      rowNumber: issue.rowNumber,
      name:
        issue.rowNumber >= 2
          ? rows[issue.rowNumber - 2]?.name?.trim() || "Tanpa nama"
          : "Validasi CSV",
      status: "error" as const,
      message: issue.message,
    }));

    return {
      ok: false,
      results: validationResults,
      successCount: 0,
      skippedCount: 0,
      errorCount: validationResults.length,
    };
  }

  const uniqueSlugs = createUniqueCsvSlugs(rows);
  const payloads = rows.map((row, index) => {
    const name = row.name?.trim() || "Tanpa nama";

    return {
      name,
      slug: uniqueSlugs[index],
      category: row.category?.trim() || "",
      brand: row.brand?.trim() || "",
      short_description: row.short_description?.trim() || "",
      description: row.description?.trim() || "",
      image_url:
        row.image_url?.trim() ||
        "/images/products/product-placeholder.svg",
      status:
        row.status?.trim().toLowerCase() === "published"
          ? "published"
          : "draft",
      performance: parseScore(row.performance),
      design: parseScore(row.design),
      features: parseScore(row.features),
      value: parseScore(row.value),
      ease_of_use: parseScore(row.ease_of_use),
      marketplace: row.marketplace?.trim() || "",
      price: parsePriceInput(row.price),
      affiliate_url: row.affiliate_url?.trim() || "",
    };
  });

  const { data, error } = await supabase.rpc(
    "import_products_from_csv_bulk_atomic",
    {
      p_rows: payloads,
      p_file_name: fileName?.trim() || null,
    },
  );

  if (error) {
    return {
      ok: false,
      results: [
        {
          rowNumber: 0,
          name: "Proses import",
          status: "error",
          message:
            "Bulk import gagal. Jalankan migration bulk CSV import terbaru di Supabase: " +
            error.message,
        },
      ],
      successCount: 0,
      skippedCount: 0,
      errorCount: 1,
    };
  }

  const response =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};

  const results: ProductCsvImportResult[] = Array.isArray(response.results)
    ? response.results.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return [];
        }

        const result = item as Record<string, unknown>;
        const status: ProductCsvImportResult["status"] =
          result.status === "success"
            ? "success"
            : result.status === "skipped"
              ? "skipped"
              : "error";

        return [
          {
            rowNumber:
              typeof result.rowNumber === "number" ? result.rowNumber : 0,
            name:
              typeof result.name === "string" ? result.name : "Tanpa nama",
            status,
            message:
              typeof result.message === "string"
                ? result.message
                : "Hasil import tidak diketahui.",
          },
        ];
      })
    : [];

  const successCount =
    typeof response.successCount === "number"
      ? response.successCount
      : results.filter((result) => result.status === "success").length;
  const skippedCount =
    typeof response.skippedCount === "number"
      ? response.skippedCount
      : results.filter((result) => result.status === "skipped").length;
  const errorCount =
    typeof response.errorCount === "number"
      ? response.errorCount
      : results.filter((result) => result.status === "error").length;

  return {
    ok: response.ok === true && errorCount === 0,
    results,
    successCount,
    skippedCount,
    errorCount,
    runId: typeof response.runId === "string" ? response.runId : undefined,
  };
}
