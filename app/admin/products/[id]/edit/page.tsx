import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAdminProductFormOptions } from "@/lib/admin-product-options";
import { getAdminProductForEdit } from "@/lib/admin-product-edit";
import {
  deleteProductImage,
  deleteProductImageByUrl,
  uploadProductImage,
} from "@/lib/product-image-upload";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
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
    .slice(0, 120);
}

function parseScore(value: FormDataEntryValue | null) {
  const score = Number(value ?? 0);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(10, Math.max(0, score));
}

async function updateProduct(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "");
  const currentImageUrl = String(
    formData.get("current_image_url") ?? "",
  ).trim();
  const name = String(formData.get("name") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || name);
  const categoryId = String(formData.get("category_id") ?? "");
  const brandId = String(formData.get("brand_id") ?? "");
  const shortDescription = String(
    formData.get("short_description") ?? "",
  ).trim();
  const description = String(formData.get("description") ?? "").trim();
  const manualImageUrl = String(
    formData.get("image_url") ?? "",
  ).trim();
  const imageFile = formData.get("image_file");
  const status = String(formData.get("status") ?? "draft");

  if (!productId || !name || !slug || !categoryId || !brandId) {
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(
        "Nama, slug, kategori, dan merek wajib diisi.",
      )}`,
    );
  }

  const allowedStatuses = new Set(["draft", "published"]);
  const safeStatus = allowedStatuses.has(status) ? status : "draft";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }

  const { data: duplicateProduct } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .neq("id", productId)
    .maybeSingle();

  if (duplicateProduct) {
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(
        "Slug sudah digunakan oleh produk lain.",
      )}`,
    );
  }

  let imageUrl =
    manualImageUrl ||
    currentImageUrl ||
    "/images/products/logitech-g102.png";

  let uploadedImagePath: string | null = null;
  let shouldDeleteOldImage = false;

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploadResult = await uploadProductImage(imageFile, slug);

    if (!uploadResult.ok) {
      redirect(
        `/admin/products/${productId}/edit?error=${encodeURIComponent(
          uploadResult.error,
        )}`,
      );
    }

    imageUrl = uploadResult.publicUrl;
    uploadedImagePath = uploadResult.path;
    shouldDeleteOldImage = imageUrl !== currentImageUrl;
  } else if (manualImageUrl && manualImageUrl !== currentImageUrl) {
    shouldDeleteOldImage = true;
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      name,
      slug,
      category_id: categoryId,
      brand_id: brandId,
      short_description: shortDescription || null,
      description: description || null,
      image_url: imageUrl,
      status: safeStatus,
    })
    .eq("id", productId);

  if (productError) {
    if (uploadedImagePath) {
      await deleteProductImage(uploadedImagePath);
    }

    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(
        productError.message,
      )}`,
    );
  }

  const scorePayload = {
    product_id: productId,
    performance: parseScore(formData.get("performance")),
    design: parseScore(formData.get("design")),
    features: parseScore(formData.get("features")),
    value: parseScore(formData.get("value")),
    ease_of_use: parseScore(formData.get("ease_of_use")),
  };

  const { error: scoreError } = await supabase
    .from("product_scores")
    .upsert(scorePayload, {
      onConflict: "product_id",
    });

  if (scoreError) {
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(
        scoreError.message,
      )}`,
    );
  }

  if (shouldDeleteOldImage) {
    await deleteProductImageByUrl(currentImageUrl);
  }

  redirect(`/admin?updated=${encodeURIComponent(name)}`);
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const [product, options] = await Promise.all([
    getAdminProductForEdit(id),
    getAdminProductFormOptions(),
  ]);

  if (!product) {
    notFound();
  }

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
                Edit Produk
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
            Edit {product.name}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Perbarui informasi dasar, gambar, dan skor produk.
          </p>

          {query.error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {query.error}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/admin/products/${product.id}/prices`}
              className="rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-bold text-white hover:bg-green-700"
            >
              Kelola Harga Marketplace
            </Link>

            <Link
              href={`/admin/products/${product.id}/specifications`}
              className="rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-slate-800"
            >
              Kelola Spesifikasi
            </Link>
          </div>

          <form
            action={updateProduct}
            encType="multipart/form-data"
            className="mt-8 space-y-6"
          >
            <input type="hidden" name="product_id" value={product.id} />
            <input
              type="hidden"
              name="current_image_url"
              value={product.imageUrl}
            />

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
                    defaultValue={product.name}
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
                    required
                    defaultValue={product.slug}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label htmlFor="category_id" className="text-sm font-bold">
                    Kategori
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    defaultValue={product.categoryId}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    {options.categories.map((category) => (
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
                    defaultValue={product.brandId}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    {options.brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="short_description" className="text-sm font-bold">
                    Deskripsi singkat
                  </label>
                  <input
                    id="short_description"
                    name="short_description"
                    maxLength={240}
                    defaultValue={product.shortDescription}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="text-sm font-bold">
                    Deskripsi lengkap
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    defaultValue={product.description}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-bold">Gambar saat ini</p>

                  <div className="mt-2 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700">
                        Gambar produk aktif
                      </p>
                      <p className="mt-1 break-all text-[10px] leading-5 text-slate-400">
                        {product.imageUrl}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="image_file" className="text-sm font-bold">
                    Ganti gambar produk
                  </label>
                  <input
                    id="image_file"
                    name="image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-orange-600"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Gambar lama di Storage akan dihapus setelah gambar baru berhasil disimpan.
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
                </div>

                <div>
                  <label htmlFor="status" className="text-sm font-bold">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={product.status}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black">Skor BelanjaLab</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Overall score dihitung otomatis.
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 px-4 py-3 text-right">
                  <p className="text-[10px] font-bold uppercase text-green-700">
                    Overall
                  </p>
                  <p className="mt-1 text-xl font-black text-green-600">
                    {product.overallScore.toFixed(1)}/10
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
                {[
                  ["performance", "Performa", product.performance],
                  ["design", "Desain", product.design],
                  ["features", "Fitur", product.features],
                  ["value", "Value", product.value],
                  ["ease_of_use", "Kemudahan", product.easeOfUse],
                ].map(([name, label, value]) => (
                  <div key={String(name)}>
                    <label htmlFor={String(name)} className="text-xs font-bold">
                      {String(label)}
                    </label>
                    <input
                      id={String(name)}
                      name={String(name)}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      defaultValue={Number(value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/admin/products/${product.id}/delete`}
                  className="rounded-xl border border-red-200 px-5 py-3 text-center text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  Hapus Produk
                </Link>

                <Link
                  href={`/admin/products/${product.id}/preview`}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-600 hover:bg-white"
                >
                  Preview Produk
                </Link>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
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
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
