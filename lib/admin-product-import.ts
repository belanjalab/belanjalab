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

export type ProductCsvImportResult = {
  rowNumber: number;
  name: string;
  status: "success" | "error";
  message: string;
};

const MAX_IMPORT_ROWS = 200;

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

function parseScore(value: string | undefined) {
  if (!value?.trim()) {
    return 0;
  }

  const score = Number(value);
  return Number.isFinite(score)
    ? Math.min(10, Math.max(0, score))
    : 0;
}

function parsePrice(value: string | undefined) {
  if (!value?.trim()) {
    return 0;
  }

  const price = Number(value);
  return Number.isFinite(price) && price > 0
    ? Math.round(price)
    : 0;
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

export async function importProductsFromCsv(
  rows: ProductCsvImportRow[],
): Promise<{
  ok: boolean;
  results: ProductCsvImportResult[];
  successCount: number;
  errorCount: number;
}> {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      ok: false,
      results: [],
      successCount: 0,
      errorCount: 0,
    };
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      ok: false,
      results: [
        {
          rowNumber: 0,
          name: "File CSV",
          status: "error",
          message: `Maksimal ${MAX_IMPORT_ROWS} produk per proses import.`,
        },
      ],
      successCount: 0,
      errorCount: 1,
    };
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      results: [
        {
          rowNumber: 0,
          name: "Sesi admin",
          status: "error",
          message: "Sesi admin tidak valid. Silakan login ulang.",
        },
      ],
      successCount: 0,
      errorCount: 1,
    };
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    return {
      ok: false,
      results: [
        {
          rowNumber: 0,
          name: "Akses admin",
          status: "error",
          message: "Akun ini tidak memiliki akses admin.",
        },
      ],
      successCount: 0,
      errorCount: 1,
    };
  }

  const [
    { data: categoryRows, error: categoryError },
    { data: brandRows, error: brandError },
    { data: marketplaceRows, error: marketplaceError },
    { data: existingProducts, error: productReadError },
  ] = await Promise.all([
    supabase.from("categories").select("id,name"),
    supabase.from("brands").select("id,name"),
    supabase.from("marketplaces").select("id,name"),
    supabase.from("products").select("slug"),
  ]);

  const setupError =
    categoryError ?? brandError ?? marketplaceError ?? productReadError;

  if (setupError) {
    return {
      ok: false,
      results: [
        {
          rowNumber: 0,
          name: "Persiapan import",
          status: "error",
          message: setupError.message,
        },
      ],
      successCount: 0,
      errorCount: 1,
    };
  }

  const categoryMap = new Map(
    (categoryRows ?? []).map((item) => [
      normalizeLookup(item.name),
      item.id,
    ]),
  );

  const brandMap = new Map(
    (brandRows ?? []).map((item) => [
      normalizeLookup(item.name),
      item.id,
    ]),
  );

  const marketplaceMap = new Map(
    (marketplaceRows ?? []).map((item) => [
      normalizeLookup(item.name),
      item.id,
    ]),
  );

  const usedSlugs = new Set(
    (existingProducts ?? []).map((item) => item.slug),
  );

  const results: ProductCsvImportResult[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 2;
    const name = row.name?.trim() ?? "";
    const slug = slugify(row.slug?.trim() || name);
    const categoryId = categoryMap.get(
      normalizeLookup(row.category ?? ""),
    );
    const brandId = brandMap.get(normalizeLookup(row.brand ?? ""));
    const marketplaceName = row.marketplace?.trim() ?? "";
    const marketplaceId = marketplaceName
      ? marketplaceMap.get(normalizeLookup(marketplaceName))
      : undefined;
    const price = parsePrice(row.price);
    const status =
      row.status?.trim().toLowerCase() === "published"
        ? "published"
        : "draft";
    const imageUrl =
      row.image_url?.trim() ||
      "/images/products/logitech-g102.png";
    const affiliateUrl = row.affiliate_url?.trim() || "#";

    if (!name || !slug) {
      results.push({
        rowNumber,
        name: name || "Tanpa nama",
        status: "error",
        message: "Nama atau slug produk tidak valid.",
      });
      continue;
    }

    if (!categoryId) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: `Kategori "${row.category}" tidak ditemukan.`,
      });
      continue;
    }

    if (!brandId) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: `Merek "${row.brand}" tidak ditemukan.`,
      });
      continue;
    }

    if (marketplaceName && !marketplaceId) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: `Marketplace "${marketplaceName}" tidak ditemukan.`,
      });
      continue;
    }

    if (marketplaceName && price <= 0) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: "Harga wajib lebih dari 0 jika marketplace diisi.",
      });
      continue;
    }

    if (!isHttpUrl(row.image_url ?? "")) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: "image_url harus berupa URL http/https yang valid.",
      });
      continue;
    }

    if (!isHttpUrl(row.affiliate_url ?? "")) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: "affiliate_url harus berupa URL http/https yang valid.",
      });
      continue;
    }

    if (usedSlugs.has(slug)) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: `Slug "${slug}" sudah digunakan.`,
      });
      continue;
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        category_id: categoryId,
        brand_id: brandId,
        short_description:
          row.short_description?.trim() || null,
        description: row.description?.trim() || null,
        image_url: imageUrl,
        status,
      })
      .select("id")
      .single();

    if (productError || !product) {
      results.push({
        rowNumber,
        name,
        status: "error",
        message: productError?.message ?? "Produk gagal dibuat.",
      });
      continue;
    }

    const { error: scoreError } = await supabase
      .from("product_scores")
      .insert({
        product_id: product.id,
        performance: parseScore(row.performance),
        design: parseScore(row.design),
        features: parseScore(row.features),
        value: parseScore(row.value),
        ease_of_use: parseScore(row.ease_of_use),
      });

    if (scoreError) {
      await supabase.from("products").delete().eq("id", product.id);

      results.push({
        rowNumber,
        name,
        status: "error",
        message: `Skor gagal disimpan: ${scoreError.message}`,
      });
      continue;
    }

    if (marketplaceId && price > 0) {
      const now = new Date().toISOString();

      const { error: priceError } = await supabase
        .from("product_prices")
        .insert({
          product_id: product.id,
          marketplace_id: marketplaceId,
          price,
          original_price: price,
          shipping_cost: 0,
          affiliate_url: affiliateUrl,
          is_available: true,
          stock_status: "in_stock",
          last_checked_at: now,
          updated_at: now,
        });

      if (priceError) {
        await supabase.from("products").delete().eq("id", product.id);

        results.push({
          rowNumber,
          name,
          status: "error",
          message: `Harga gagal disimpan: ${priceError.message}`,
        });
        continue;
      }
    }

    usedSlugs.add(slug);

    results.push({
      rowNumber,
      name,
      status: "success",
      message: `Produk berhasil diimport sebagai ${status}.`,
    });
  }

  const successCount = results.filter(
    (result) => result.status === "success",
  ).length;
  const errorCount = results.length - successCount;

  return {
    ok: errorCount === 0,
    results,
    successCount,
    errorCount,
  };
}
