import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAdminProductFormOptions } from "@/lib/admin-product-options";
import { getAdminProductForEdit } from "@/lib/admin-product-edit";

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

function parsePrice(value: FormDataEntryValue | null) {
  const price = Number(value ?? 0);

  if (!Number.isFinite(price) || price < 0) {
    return 0;
  }

  return Math.round(price);
}

async function updateProduct(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "");
  const priceId = String(formData.get("price_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || name);
  const categoryId = String(formData.get("category_id") ?? "");
  const brandId = String(formData.get("brand_id") ?? "");
  const shortDescription = String(
    formData.get("short_description") ?? "",
  ).trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
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

  const { error: productError } = await supabase
    .from("products")
    .update({
      name,
      slug,
      category_id: categoryId,
      brand_id: brandId,
      short_description: shortDescription || null,
      description: description || null,
      image_url:
        imageUrl || "/images/products/logitech-g102.png",
      status: safeStatus,
    })
    .eq("id", productId);

  if (productError) {
    console.error("Gagal memperbarui produk:", productError);

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
    console.error("Gagal memperbarui skor produk:", scoreError);
  }

  const marketplaceId = String(formData.get("marketplace_id") ?? "");
  const price = parsePrice(formData.get("price"));
  const affiliateUrl = String(
    formData.get("affiliate_url") ?? "",
  ).trim();

  if (marketplaceId && price > 0) {
    const pricePayload = {
      product_id: productId,
      marketplace_id: marketplaceId,
      price,
      original_price: price,
      shipping_cost: 0,
      affiliate_url: affiliateUrl || "#",
      is_available: true,
      stock_status: "in_stock",
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const priceQuery = priceId
      ? supabase
          .from("product_prices")
          .update(pricePayload)
          .eq("id", priceId)
      : supabase.from("product_prices").insert(pricePayload);

    const { error: priceError } = await priceQuery;

    if (priceError) {
      console.error("Gagal memperbarui harga produk:", priceError);
    }
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
            Perbarui informasi dasar, skor, dan harga produk.
          </p>

          {query.error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {query.error}
            </div>
          )}

          <form action={updateProduct} className="mt-8 space-y-6">
            <input type="hidden" name="product_id" value={product.id} />
            <input
              type="hidden"
              name="price_id"
              value={product.priceId ?? ""}
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
                    defaultValue={product.shortDescription}
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
                    defaultValue={product.description}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label htmlFor="image_url" className="text-sm font-bold">
                    URL/path gambar
                  </label>
                  <input
                    id="image_url"
                    name="image_url"
                    defaultValue={product.imageUrl}
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
                    <label
                      htmlFor={String(name)}
                      className="text-xs font-bold"
                    >
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

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-lg font-black">Harga Marketplace</h2>
              <p className="mt-1 text-xs text-slate-500">
                Form ini mengedit harga marketplace pertama pada produk.
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
                    defaultValue={product.marketplaceId}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="">Belum ada</option>
                    {options.marketplaces.map((marketplace) => (
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
                    defaultValue={product.price || ""}
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
                    defaultValue={
                      product.affiliateUrl === "#"
                        ? ""
                        : product.affiliateUrl
                    }
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row">
  <Link
    href={`/admin/products/${product.id}/delete`}
    className="rounded-xl border border-red-200 px-5 py-3 text-center text-sm font-bold text-red-600 hover:bg-red-50"
  >
    Hapus Produk
  </Link>

  <Link
    href={`/product/${product.slug}`}
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
