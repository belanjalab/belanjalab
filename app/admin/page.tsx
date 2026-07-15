import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getAdminProductsPage,
  type AdminProductCompleteness,
  type AdminProductSort,
} from "@/lib/admin-products";
import BulkProductActions from "@/components/admin/bulk-product-actions";
import { deleteProductImageByUrl } from "@/lib/product-image-upload";
import { getAdminDashboardStats } from "@/lib/admin-dashboard-stats";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    status?: string;
    q?: string | string[];
    page?: string;
    sort?: string;
    completeness?: string;
    category?: string;
    brand?: string;
    error?: string;
    bulk_updated?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

async function logout() {
  "use server";

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/admin/login");
}

async function updateBulkProductStatus(formData: FormData) {
  "use server";

  const productIds = Array.from(
    new Set(
      formData
        .getAll("product_ids")
        .map((value) => String(value))
        .filter(Boolean),
    ),
  );

  const requestedAction = String(formData.get("bulk_action") ?? "");
  const categoryName = String(formData.get("category_name") ?? "").trim();
  const brandName = String(formData.get("brand_name") ?? "").trim();

  if (
    productIds.length === 0 ||
    ![
      "published",
      "draft",
      "delete",
      "assign_category",
      "assign_brand",
    ].includes(requestedAction)
  ) {
    redirect(
      `/admin?error=${encodeURIComponent(
        "Pilih minimal satu produk dan tindakan yang valid.",
      )}`,
    );
  }

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

  if (requestedAction === "assign_category") {
    if (!categoryName) {
      redirect(
        `/admin?error=${encodeURIComponent(
          "Pilih kategori sebelum menerapkan perubahan massal.",
        )}`,
      );
    }

    const { data: categoryRecord, error: categoryError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("name", categoryName)
      .maybeSingle();

    if (categoryError || !categoryRecord) {
      redirect(
        `/admin?error=${encodeURIComponent(
          categoryError?.message ?? "Kategori tidak ditemukan.",
        )}`,
      );
    }

    const { error: updateCategoryError } = await supabase
      .from("products")
      .update({ category_id: categoryRecord.id })
      .in("id", productIds);

    if (updateCategoryError) {
      redirect(
        `/admin?error=${encodeURIComponent(updateCategoryError.message)}`,
      );
    }

    redirect(
      `/admin?bulk_updated=${encodeURIComponent(
        `${productIds.length} produk dipindahkan ke kategori ${categoryRecord.name}.`,
      )}`,
    );
  }

  if (requestedAction === "assign_brand") {
    if (!brandName) {
      redirect(
        `/admin?error=${encodeURIComponent(
          "Pilih merek sebelum menerapkan perubahan massal.",
        )}`,
      );
    }

    const { data: brandRecord, error: brandError } = await supabase
      .from("brands")
      .select("id, name")
      .eq("name", brandName)
      .maybeSingle();

    if (brandError || !brandRecord) {
      redirect(
        `/admin?error=${encodeURIComponent(
          brandError?.message ?? "Merek tidak ditemukan.",
        )}`,
      );
    }

    const { error: updateBrandError } = await supabase
      .from("products")
      .update({ brand_id: brandRecord.id })
      .in("id", productIds);

    if (updateBrandError) {
      redirect(
        `/admin?error=${encodeURIComponent(updateBrandError.message)}`,
      );
    }

    redirect(
      `/admin?bulk_updated=${encodeURIComponent(
        `${productIds.length} produk dipindahkan ke merek ${brandRecord.name}.`,
      )}`,
    );
  }

  if (requestedAction === "delete") {
    const { data: productsToDelete, error: readError } = await supabase
      .from("products")
      .select("id, image_url")
      .in("id", productIds);

    if (readError) {
      redirect(
        `/admin?error=${encodeURIComponent(readError.message)}`,
      );
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .in("id", productIds);

    if (deleteError) {
      redirect(
        `/admin?error=${encodeURIComponent(deleteError.message)}`,
      );
    }

    const cleanupResults = await Promise.allSettled(
      (productsToDelete ?? []).map((product) =>
        deleteProductImageByUrl(product.image_url),
      ),
    );

    const cleanupFailureCount = cleanupResults.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.ok),
    ).length;

    const message =
      cleanupFailureCount > 0
        ? `${productIds.length} produk dihapus. ${cleanupFailureCount} gambar gagal dibersihkan dari Storage.`
        : `${productIds.length} produk dan gambar terkait berhasil dihapus.`;

    redirect(
      `/admin?bulk_updated=${encodeURIComponent(message)}`,
    );
  }

  const status =
    requestedAction === "published" ? "published" : "draft";

  const { error } = await supabase
    .from("products")
    .update({
      status,
    })
    .in("id", productIds);

  if (error) {
    redirect(
      `/admin?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/admin?bulk_updated=${encodeURIComponent(
      `${productIds.length} produk diubah menjadi ${status}.`,
    )}`,
  );
}

export default async function AdminPage({
  searchParams,
}: AdminPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("user_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    await supabase.auth.signOut();

    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }

  const activeStatus =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";

  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim() ?? "";
  const requestedPage = Number(params.page ?? "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.floor(requestedPage)
    : 1;

  const allowedSorts = new Set([
    "newest",
    "oldest",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
    "score_desc",
    "score_asc",
  ]);

  const sort: AdminProductSort = allowedSorts.has(params.sort ?? "")
    ? (params.sort as AdminProductSort)
    : "newest";

  const completeness: AdminProductCompleteness =
    params.completeness === "without_price" ||
    params.completeness === "without_score"
      ? params.completeness
      : "all";

  const category = (params.category ?? "").trim();
  const brand = (params.brand ?? "").trim();

  const [{ data: categoryRows }, { data: brandRows }] = await Promise.all([
    supabase
      .from("categories")
      .select("name")
      .order("name", { ascending: true }),
    supabase
      .from("brands")
      .select("name")
      .order("name", { ascending: true }),
  ]);

  const categories = (categoryRows ?? [])
    .map((item) => item.name)
    .filter(Boolean);

  const brands = (brandRows ?? [])
    .map((item) => item.name)
    .filter(Boolean);

  const itemsPerPage = 10;

  const [productPage, stats] = await Promise.all([
    getAdminProductsPage({
      status: activeStatus,
      query,
      page,
      pageSize: itemsPerPage,
      sort,
      completeness,
      category,
      brand,
    }),
    getAdminDashboardStats(),
  ]);

  const products = productPage.products;
  const totalResults = productPage.total;
  const currentPage = productPage.page;
  const totalPages = productPage.totalPages;
  const startIndex = (currentPage - 1) * productPage.pageSize;

  const totalCount = stats.totalProducts;
  const publishedCount = stats.publishedProducts;
  const draftCount = stats.draftProducts;

  function buildAdminUrl(targetPage: number) {
    const search = new URLSearchParams();

    if (activeStatus !== "all") {
      search.set("status", activeStatus);
    }

    if (query) {
      search.set("q", query);
    }

    if (sort !== "newest") {
      search.set("sort", sort);
    }

    if (completeness !== "all") {
      search.set("completeness", completeness);
    }

    if (category) {
      search.set("category", category);
    }

    if (brand) {
      search.set("brand", brand);
    }

    if (targetPage > 1) {
      search.set("page", String(targetPage));
    }

    const queryString = search.toString();

    return queryString ? `/admin?${queryString}` : "/admin";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
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
                Admin
              </p>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-slate-700">
                {adminRecord.display_name ?? "BelanjaLab Admin"}
              </p>
              <p className="text-[10px] text-slate-400">
                {user.email}
              </p>
            </div>

            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Lihat Website
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          {params.created && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
            >
              Produk “{params.created}” berhasil dibuat.
            </div>
          )}

          {params.updated && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"
            >
              Produk “{params.updated}” berhasil diperbarui.
            </div>
          )}

          {params.deleted && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              Produk “{params.deleted}” berhasil dihapus.
            </div>
          )}

          {params.bulk_updated && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
            >
              {params.bulk_updated}
            </div>
          )}

          {params.error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {params.error}
            </div>
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                CMS Admin
              </p>

              <h1 className="mt-2 text-3xl font-black md:text-4xl">
                Daftar Produk
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Kelola katalog produk, harga marketplace, skor, kategori, dan
                merek BelanjaLab.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/admin/taxonomies"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 shadow-sm hover:border-orange-300 hover:text-orange-500"
              >
                Kelola Kategori & Merek
              </Link>

              <Link
                href="/admin/products/new"
                className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-orange-600"
              >
                + Tambah Produk
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs text-slate-500">Total produk</p>
              <p className="mt-1 text-2xl font-black">{stats.totalProducts}</p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4">
              <p className="text-xs text-green-700">Published</p>
              <p className="mt-1 text-2xl font-black text-green-700">
                {stats.publishedProducts}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-xs text-amber-700">Draft</p>
              <p className="mt-1 text-2xl font-black text-amber-700">
                {stats.draftProducts}
              </p>
            </div>

            <Link
              href="/admin/taxonomies"
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 transition hover:border-blue-300"
            >
              <p className="text-xs text-blue-700">Kategori & merek</p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {stats.totalCategories} / {stats.totalBrands}
              </p>
            </Link>

            <Link
              href="/admin?completeness=without_price"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 transition hover:border-red-300"
            >
              <p className="text-xs text-red-700">Tanpa harga</p>
              <p className="mt-1 text-2xl font-black text-red-700">
                {stats.productsWithoutPrice}
              </p>
            </Link>

            <Link
              href="/admin?completeness=without_score"
              className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-4 transition hover:border-violet-300"
            >
              <p className="text-xs text-violet-700">Tanpa skor</p>
              <p className="mt-1 text-2xl font-black text-violet-700">
                {stats.productsWithoutScore}
              </p>
            </Link>
          </div>

          {completeness !== "all" && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-xs font-bold text-orange-700">
                Filter aktif:{" "}
                {completeness === "without_price"
                  ? "Produk tanpa harga"
                  : "Produk tanpa skor"}
              </p>

              <Link
                href={buildAdminUrl(1).replace(
                  /([?&])completeness=[^&]+&?/,
                  "$1",
                ).replace(/[?&]$/, "")}
                className="ml-auto text-xs font-bold text-orange-700 underline"
              >
                Hapus filter
              </Link>
            </div>
          )}

          <form
            action="/admin"
            method="get"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
          >
            {activeStatus !== "all" && (
              <input
                type="hidden"
                name="status"
                value={activeStatus}
              />
            )}

            {completeness !== "all" && (
              <input
                type="hidden"
                name="completeness"
                value={completeness}
              />
            )}

            {category && (
              <input
                type="hidden"
                name="category"
                value={category}
              />
            )}

            {brand && (
              <input
                type="hidden"
                name="brand"
                value={brand}
              />
            )}

            <input
              type="search"
              name="q"
              defaultValue={rawQuery ?? ""}
              placeholder="Cari nama, slug, merek, atau kategori..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />

            <select
              name="sort"
              defaultValue={sort}
              aria-label="Urutkan produk"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="name_asc">Nama A–Z</option>
              <option value="name_desc">Nama Z–A</option>
              <option value="price_asc">Harga termurah</option>
              <option value="price_desc">Harga termahal</option>
              <option value="score_desc">Skor tertinggi</option>
              <option value="score_asc">Skor terendah</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Cari Produk
            </button>

            {(query ||
              activeStatus !== "all" ||
              sort !== "newest" ||
              completeness !== "all" ||
              category ||
              brand) && (
              <Link
                href="/admin"
                className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </Link>
            )}
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ["all", "Semua", totalCount],
              ["published", "Published", publishedCount],
              ["draft", "Draft", draftCount],
            ].map(([value, label, count]) => {
              const isActive = activeStatus === value;

              return (
                <Link
                  key={String(value)}
                  href={
                    value === "all"
                      ? new URLSearchParams({
                          ...(query ? { q: rawQuery ?? "" } : {}),
                          ...(sort !== "newest" ? { sort } : {}),
                          ...(completeness !== "all"
                            ? { completeness }
                            : {}),
                        }).toString()
                        ? `/admin?${new URLSearchParams({
                            ...(query ? { q: rawQuery ?? "" } : {}),
                            ...(sort !== "newest" ? { sort } : {}),
                            ...(completeness !== "all"
                              ? { completeness }
                              : {}),
                            ...(category ? { category } : {}),
                            ...(brand ? { brand } : {}),
                          }).toString()}`
                        : "/admin"
                      : `/admin?${new URLSearchParams({
                          status: String(value),
                          ...(query ? { q: rawQuery ?? "" } : {}),
                          ...(sort !== "newest" ? { sort } : {}),
                          ...(completeness !== "all"
                            ? { completeness }
                            : {}),
                        }).toString()}`
                  }
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  }`}
                >
                  {String(label)} ({Number(count)})
                </Link>
              );
            })}
          </div>

          {products.length > 0 && (
            <form action={updateBulkProductStatus} className="mt-6">
              <BulkProductActions
                products={products.map((product) => ({
                  id: product.id,
                  name: product.name,
                  status: product.status,
                }))}
                categories={categories}
                brands={brands}
              />
            </form>
          )}

          {products.length > 0 ? (
            <>
              <div className="mt-8 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_160px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  <span>Produk</span>
                  <span>Kategori</span>
                  <span>Harga</span>
                  <span>Skor</span>
                  <span>Status</span>
                  <span>Aksi</span>
                </div>

                {products.map((product) => (
                  <div
                    key={product.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_160px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {product.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {product.brand} · {product.slug}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatDate(product.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-600">
                      {product.category}
                    </p>

                    <p className="text-sm font-bold">
                      {product.formattedPrice}
                    </p>

                    <p className="text-sm font-black text-green-600">
                      {product.score !== null
                        ? `${product.score.toFixed(1)}/10`
                        : "—"}
                    </p>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          product.status === "published"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/preview`}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
                      >
                        Preview
                      </Link>

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 md:hidden">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-sm font-black leading-5">
                            {product.name}
                          </h2>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold capitalize ${
                              product.status === "published"
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {product.brand} · {product.category}
                        </p>

                        <p className="mt-3 text-sm font-black text-orange-500">
                          {product.formattedPrice}
                        </p>

                        <p className="mt-1 text-xs font-bold text-green-600">
                          Skor{" "}
                          {product.score !== null
                            ? `${product.score.toFixed(1)}/10`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <p className="text-[10px] text-slate-400">
                        {formatDate(product.createdAt)}
                      </p>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/preview`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600"
                        >
                          Preview
                        </Link>

                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-[10px] font-bold text-white"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm font-black">
                Produk tidak ditemukan.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Coba kata kunci lain, ubah filter status, atau tambahkan produk baru.
              </p>

              <Link
                href="/admin/products/new"
                className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                + Tambah Produk
              </Link>
            </div>
          )}

          {totalResults > productPage.pageSize && (
            <nav
              aria-label="Pagination produk admin"
              className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-xs text-slate-500">
                Menampilkan {startIndex + 1}–
                {Math.min(startIndex + productPage.pageSize, totalResults)} dari{" "}
                {totalResults} produk
              </p>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                {currentPage > 1 ? (
                  <Link
                    href={buildAdminUrl(currentPage - 1)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  >
                    ← Sebelumnya
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-slate-100 px-4 py-2 text-xs font-bold text-slate-300">
                    ← Sebelumnya
                  </span>
                )}

                <span className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white">
                  {currentPage} / {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={buildAdminUrl(currentPage + 1)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  >
                    Berikutnya →
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-slate-100 px-4 py-2 text-xs font-bold text-slate-300">
                    Berikutnya →
                  </span>
                )}
              </div>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
