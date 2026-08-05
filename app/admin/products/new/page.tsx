import Link from "next/link";
import { redirect } from "next/navigation";
import { sanitizePublicUrl } from "@/lib/site-config";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAdminProductFormOptions } from "@/lib/admin-product-options";
import {
  deleteProductImage,
  uploadProductImage,
} from "@/lib/product-image-upload";

export const dynamic = "force-dynamic";

type NewProductPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

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

function parseScore(value: FormDataEntryValue | null) {
  const score = Number(value ?? 0);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(10, Math.max(0, score));
}

function parsePrice(value: FormDataEntryValue | null) {
  const price = Number(value ?? 0);

  if (!Number.isFinite(price) || price < 0) {
    return 0;
  }

  return Math.round(price);
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidImageUrl(value: string) {
  return (
    !value ||
    sanitizePublicUrl(value, {
      allowHash: false,
      allowMailto: false,
    }) !== null
  );
}

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || name);
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const brandId = String(formData.get("brand_id") ?? "").trim();
  const shortDescription = String(
    formData.get("short_description") ?? "",
  ).trim();
  const description = String(formData.get("description") ?? "").trim();
  const manualImageUrl = String(formData.get("image_url") ?? "").trim();
  const imageFile = formData.get("image_file");
  const status = String(formData.get("status") ?? "draft");
  const marketplaceId = String(
    formData.get("marketplace_id") ?? "",
  ).trim();
  const price = parsePrice(formData.get("price"));
  const affiliateUrl = String(
    formData.get("affiliate_url") ?? "",
  ).trim();
  const errorUrl = (message: string) =>
    `/admin/products/new?error=${encodeURIComponent(message)}`;

  if (!name || !slug || !categoryId || !brandId) {
    redirect(errorUrl("Nama, slug, kategori, dan merek wajib diisi."));
  }

  if (name.length > 200) {
    redirect(errorUrl("Nama produk maksimal 200 karakter."));
  }

  if (!isValidImageUrl(manualImageUrl)) {
    redirect(
      errorUrl(
        "URL gambar harus berupa URL http/https atau path internal yang valid.",
      ),
    );
  }

  if (affiliateUrl && !isHttpUrl(affiliateUrl)) {
    redirect(errorUrl("URL affiliate harus berupa URL http atau https."));
  }

  if (marketplaceId && price <= 0) {
    redirect(errorUrl("Harga wajib lebih dari 0 jika marketplace dipilih."));
  }

  if (!marketplaceId && (price > 0 || affiliateUrl)) {
    redirect(
      errorUrl(
        "Marketplace wajib dipilih jika harga atau URL affiliate diisi.",
      ),
    );
  }

  const allowedStatuses = new Set(["draft", "published"]);
  const safeStatus = allowedStatuses.has(status) ? status : "draft";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        adminError?.message ?? "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }

  const { data: existingProduct, error: duplicateError } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (duplicateError) {
    redirect(errorUrl(`Gagal memeriksa slug: ${duplicateError.message}`));
  }

  if (existingProduct) {
    redirect(errorUrl("Slug sudah digunakan oleh produk lain."));
  }

  let imageUrl =
    manualImageUrl || "/images/products/product-placeholder.svg";
  let uploadedImagePath: string | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploadResult = await uploadProductImage(imageFile, slug);

    if (uploadResult.ok) {
      imageUrl = uploadResult.publicUrl;
      uploadedImagePath = uploadResult.path;
    } else {
      redirect(errorUrl(uploadResult.error));
    }
  }

  const cleanupUploadedImage = async () => {
    if (uploadedImagePath) {
      await deleteProductImage(uploadedImagePath);
    }
  };

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id: categoryId,
      brand_id: brandId,
      short_description: shortDescription || null,
      description: description || null,
      image_url: imageUrl,
      status: safeStatus,
    })
    .select("id")
    .single();

  if (productError || !product) {
    await cleanupUploadedImage();
    redirect(errorUrl(productError?.message ?? "Produk gagal dibuat."));
  }

  const rollbackProduct = async () => {
    const { data: priceRows } = await supabase
      .from("product_prices")
      .select("id")
      .eq("product_id", product.id);
    const priceIds = (priceRows ?? []).map((item: { id: string }) => item.id);

    if (priceIds.length > 0) {
      await supabase
        .from("product_price_history")
        .delete()
        .in("product_price_id", priceIds);
    }

    await supabase
      .from("product_prices")
      .delete()
      .eq("product_id", product.id);
    await supabase
      .from("product_scores")
      .delete()
      .eq("product_id", product.id);
    await supabase.from("products").delete().eq("id", product.id);
    await cleanupUploadedImage();
  };

  const { error: scoreError } = await supabase
    .from("product_scores")
    .insert({
      product_id: product.id,
      performance: parseScore(formData.get("performance")),
      design: parseScore(formData.get("design")),
      features: parseScore(formData.get("features")),
      value: parseScore(formData.get("value")),
      ease_of_use: parseScore(formData.get("ease_of_use")),
    });

  if (scoreError) {
    await rollbackProduct();
    redirect(errorUrl(`Skor produk gagal disimpan: ${scoreError.message}`));
  }

  if (marketplaceId) {
    const now = new Date().toISOString();
    const { data: priceRow, error: priceError } = await supabase
      .from("product_prices")
      .insert({
        product_id: product.id,
        marketplace_id: marketplaceId,
        price,
        original_price: price,
        shipping_cost: 0,
        affiliate_url: affiliateUrl || null,
        is_available: true,
        stock_status: "in_stock",
        last_checked_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (priceError || !priceRow) {
      await rollbackProduct();
      redirect(
        errorUrl(
          `Harga produk gagal disimpan: ${
            priceError?.message ?? "Data harga tidak terbentuk."
          }`,
        ),
      );
    }

    const { error: historyError } = await supabase
      .from("product_price_history")
      .insert({
        product_price_id: priceRow.id,
        price,
        captured_at: now,
      });

    if (historyError) {
      await rollbackProduct();
      redirect(
        errorUrl(`Riwayat harga gagal disimpan: ${historyError.message}`),
      );
    }
  }

  redirect(`/admin?created=${encodeURIComponent(name)}`);
}

export default async function NewProductPage({
  searchParams,
}: NewProductPageProps) {
  const params = await searchParams;
  const { categories, brands, marketplaces } =
    await getAdminProductFormOptions();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-9 w-9 rounded-full object-cover"
            />

            <div>
              <p className="text-sm font-black">
                Belanja<span className="text-orange-500">Lab</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Tambah Produk
              </p>
            </div>
          </Link>

          <Link
            href="/admin"
            className="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Kembali
          </Link>
        </div>
      </header>

      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            CMS Admin
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Tambah Produk Baru
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Isi informasi dasar, gambar, penilaian, dan harga awal produk.
          </p>

          {params.error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {params.error}
            </div>
          )}

          <form
            action={createProduct}
            encType="multipart/form-data"
            className="mt-8 space-y-6"
          >
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-lg font-black">Informasi Produk</h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm font-bold">
                    Nama produk
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    placeholder="Contoh: Logitech G304"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="text-sm font-bold">
                    Slug
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    placeholder="Otomatis dari nama jika dikosongkan"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category_id"
                    className="text-sm font-bold"
                  >
                    Kategori
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="" disabled>
                      Pilih kategori
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="brand_id" className="text-sm font-bold">
                    Merek
                  </label>
                  <select
                    id="brand_id"
                    name="brand_id"
                    required
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="" disabled>
                      Pilih merek
                    </option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="short_description"
                    className="text-sm font-bold"
                  >
                    Deskripsi singkat
                  </label>
                  <input
                    id="short_description"
                    name="short_description"
                    maxLength={240}
                    placeholder="Ringkasan singkat produk"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-bold"
                  >
                    Deskripsi lengkap
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    placeholder="Jelaskan kelebihan, kekurangan, dan target pengguna."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="image_file"
                    className="text-sm font-bold"
                  >
                    Upload gambar produk
                  </label>
                  <input
                    id="image_file"
                    name="image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-orange-600"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    JPG, PNG, atau WebP. Maksimal 5 MB.
                  </p>
                </div>

                <div>
                  <label htmlFor="image_url" className="text-sm font-bold">
                    URL gambar alternatif
                  </label>
                  <input
                    id="image_url"
                    name="image_url"
                    type="url"
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Dipakai jika tidak mengunggah file.
                  </p>
                </div>

                <div>
                  <label htmlFor="status" className="text-sm font-bold">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="draft"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-lg font-black">Skor BelanjaLab</h2>
              <p className="mt-1 text-xs text-slate-500">
                Isi nilai 0 sampai 10. Overall score dihitung otomatis.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
                {[
                  ["performance", "Performa"],
                  ["design", "Desain"],
                  ["features", "Fitur"],
                  ["value", "Value"],
                  ["ease_of_use", "Kemudahan"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label htmlFor={name} className="text-xs font-bold">
                      {label}
                    </label>
                    <input
                      id={name}
                      name={name}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      defaultValue="0"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-lg font-black">Harga Awal</h2>
              <p className="mt-1 text-xs text-slate-500">
                Bagian ini boleh dikosongkan dan diisi nanti.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="marketplace_id"
                    className="text-sm font-bold"
                  >
                    Marketplace
                  </label>
                  <select
                    id="marketplace_id"
                    name="marketplace_id"
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="">Belum ada</option>
                    {marketplaces.map((marketplace) => (
                      <option
                        key={marketplace.id}
                        value={marketplace.id}
                      >
                        {marketplace.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="text-sm font-bold">
                    Harga
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="250000"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="affiliate_url"
                    className="text-sm font-bold"
                  >
                    Link toko
                  </label>
                  <input
                    id="affiliate_url"
                    name="affiliate_url"
                    type="url"
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/admin"
                className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-600 hover:bg-white"
              >
                Batal
              </Link>

              <button
                type="submit"
                className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
