import { createSupabaseServerClient } from "./supabase-server";

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function sanitizeFileName(value: string) {
  const extension = value.split(".").pop()?.toLowerCase() ?? "webp";
  const baseName = value
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return `${baseName || "product-image"}.${extension}`;
}

function sanitizeProductSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function getProductImageStoragePath(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = url.pathname.slice(
      markerIndex + marker.length,
    );

    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

export type ProductImageUploadResult =
  | {
      ok: true;
      publicUrl: string;
      path: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function uploadProductImage(
  file: File,
  productSlug: string,
): Promise<ProductImageUploadResult> {
  if (!file || file.size === 0) {
    return {
      ok: false,
      error: "File gambar belum dipilih.",
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Format gambar harus JPG, PNG, atau WebP.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: "Ukuran gambar maksimal 5 MB.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Sesi admin tidak valid.",
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
      error: "Akun ini tidak memiliki akses admin.",
    };
  }

  const safeSlug = sanitizeProductSlug(productSlug);
  const fileName = sanitizeFileName(file.name);
  const filePath = `${safeSlug || "product"}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Gagal upload gambar produk:", uploadError);

    return {
      ok: false,
      error: uploadError.message,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    ok: true,
    publicUrl,
    path: filePath,
  };
}

export async function deleteProductImage(
  path: string | null | undefined,
) {
  if (!path) {
    return {
      ok: true as const,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error("Gagal menghapus gambar produk:", error);

    return {
      ok: false as const,
      error: error.message,
    };
  }

  return {
    ok: true as const,
  };
}

export async function deleteProductImageByUrl(
  imageUrl: string | null | undefined,
) {
  const path = getProductImageStoragePath(imageUrl);

  if (!path) {
    return {
      ok: true as const,
      skipped: true as const,
    };
  }

  const result = await deleteProductImage(path);

  return {
    ...result,
    skipped: false as const,
  };
}
