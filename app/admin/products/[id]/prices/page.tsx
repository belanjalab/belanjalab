import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAdminProductForEdit } from "@/lib/admin-product-edit";
import { getAdminProductFormOptions } from "@/lib/admin-product-options";
import { getAdminProductPrices } from "@/lib/admin-product-prices";

export const dynamic = "force-dynamic";

type ProductPricesPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

function parseMoney(value: FormDataEntryValue | null) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return Math.round(number);
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function requireAdmin() {
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

  return supabase;
}

async function savePrice(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "").trim();
  const priceId = String(formData.get("price_id") ?? "").trim();
  const marketplaceId = String(
    formData.get("marketplace_id") ?? "",
  ).trim();
  const price = parseMoney(formData.get("price"));
  const originalPriceInput = parseMoney(formData.get("original_price"));
  const originalPrice = originalPriceInput > 0 ? originalPriceInput : price;
  const shippingCost = parseMoney(formData.get("shipping_cost"));
  const affiliateUrl = String(
    formData.get("affiliate_url") ?? "",
  ).trim();
  const stockStatus = String(
    formData.get("stock_status") ?? "in_stock",
  );
  const isAvailable =
    String(formData.get("is_available") ?? "true") === "true";
  const pageUrl = `/admin/products/${productId}/prices`;
  const errorUrl = (message: string) =>
    `${pageUrl}?error=${encodeURIComponent(message)}`;

  if (!productId || !marketplaceId || price <= 0) {
    redirect(errorUrl("Marketplace dan harga wajib diisi."));
  }

  if (originalPrice < price) {
    redirect(
      errorUrl("Harga normal tidak boleh lebih kecil dari harga saat ini."),
    );
  }

  if (affiliateUrl && !isHttpUrl(affiliateUrl)) {
    redirect(errorUrl("URL affiliate harus berupa URL http atau https."));
  }

  const allowedStockStatuses = new Set([
    "in_stock",
    "low_stock",
    "out_of_stock",
    "preorder",
    "unknown",
  ]);
  const safeStockStatus = allowedStockStatuses.has(stockStatus)
    ? stockStatus
    : "unknown";
  const supabase = await requireAdmin();
  const now = new Date().toISOString();
  const payload = {
    product_id: productId,
    marketplace_id: marketplaceId,
    price,
    original_price: originalPrice,
    shipping_cost: shippingCost,
    affiliate_url: affiliateUrl || null,
    is_available: isAvailable,
    stock_status: safeStockStatus,
    last_checked_at: now,
    updated_at: now,
  };

  if (priceId) {
    const { data: currentPrice, error: currentPriceError } = await supabase
      .from("product_prices")
      .select(
        "id, product_id, marketplace_id, price, original_price, shipping_cost, affiliate_url, is_available, stock_status, last_checked_at, updated_at",
      )
      .eq("id", priceId)
      .eq("product_id", productId)
      .maybeSingle();

    if (currentPriceError || !currentPrice) {
      redirect(
        errorUrl(
          currentPriceError?.message ?? "Data harga tidak ditemukan.",
        ),
      );
    }

    const { data: updatedPrice, error: updateError } = await supabase
      .from("product_prices")
      .update(payload)
      .eq("id", priceId)
      .eq("product_id", productId)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedPrice) {
      redirect(
        errorUrl(updateError?.message ?? "Harga gagal diperbarui."),
      );
    }

    const previousPrice = Number(currentPrice.price);

    if (Number.isFinite(previousPrice) && previousPrice !== price) {
      const { count, error: historyCountError } = await supabase
        .from("product_price_history")
        .select("product_price_id", { count: "exact", head: true })
        .eq("product_price_id", priceId);
      const historyEntries: Array<{
        product_price_id: string;
        price: number;
        captured_at: string;
      }> = [];

      if (!historyCountError && (count ?? 0) === 0) {
        historyEntries.push({
          product_price_id: priceId,
          price: previousPrice,
          captured_at: new Date(new Date(now).getTime() - 1000).toISOString(),
        });
      }

      historyEntries.push({
        product_price_id: priceId,
        price,
        captured_at: now,
      });

      const historyError = historyCountError
        ? historyCountError
        : (
            await supabase
              .from("product_price_history")
              .insert(historyEntries)
          ).error;

      if (historyError) {
        const { error: rollbackError } = await supabase
          .from("product_prices")
          .update({
            marketplace_id: currentPrice.marketplace_id,
            price: currentPrice.price,
            original_price: currentPrice.original_price,
            shipping_cost: currentPrice.shipping_cost,
            affiliate_url: currentPrice.affiliate_url,
            is_available: currentPrice.is_available,
            stock_status: currentPrice.stock_status,
            last_checked_at: currentPrice.last_checked_at,
            updated_at: currentPrice.updated_at,
          })
          .eq("id", priceId)
          .eq("product_id", productId);

        redirect(
          errorUrl(
            rollbackError
              ? `Riwayat harga gagal disimpan dan rollback harga gagal: ${historyError.message}. Periksa data sebelum mencoba lagi.`
              : `Riwayat harga gagal disimpan. Perubahan harga telah dibatalkan: ${historyError.message}`,
          ),
        );
      }
    }
  } else {
    const { data: insertedPrice, error: insertError } = await supabase
      .from("product_prices")
      .insert(payload)
      .select("id")
      .single();

    if (insertError || !insertedPrice) {
      redirect(
        errorUrl(insertError?.message ?? "Harga gagal ditambahkan."),
      );
    }

    const { error: historyError } = await supabase
      .from("product_price_history")
      .insert({
        product_price_id: insertedPrice.id,
        price,
        captured_at: now,
      });

    if (historyError) {
      await supabase
        .from("product_prices")
        .delete()
        .eq("id", insertedPrice.id)
        .eq("product_id", productId);
      redirect(
        errorUrl(
          `Riwayat harga gagal disimpan. Harga baru telah dibatalkan: ${historyError.message}`,
        ),
      );
    }
  }

  redirect(
    `${pageUrl}?message=${encodeURIComponent(
      "Harga marketplace berhasil disimpan.",
    )}`,
  );
}

async function deletePrice(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "").trim();
  const priceId = String(formData.get("price_id") ?? "").trim();

  if (!productId || !priceId) {
    redirect(`/admin/products/${productId}/prices`);
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("product_prices")
    .delete()
    .eq("id", priceId)
    .eq("product_id", productId);

  if (error) {
    redirect(
      `/admin/products/${productId}/prices?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(
    `/admin/products/${productId}/prices?message=${encodeURIComponent(
      "Harga marketplace berhasil dihapus.",
    )}`,
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ProductPricesPage({
  params,
  searchParams,
}: ProductPricesPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const [product, prices, options] = await Promise.all([
    getAdminProductForEdit(id),
    getAdminProductPrices(id),
    getAdminProductFormOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-9 w-9 rounded-full object-cover"
            />

            <div>
              <p className="text-sm font-black">
                Belanja<span className="text-amber-700">Lab</span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Harga Marketplace
              </p>
            </div>
          </Link>

          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex min-h-11 items-center justify-center ml-auto rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Kembali ke Edit
          </Link>
        </div>
      </header>

      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            CMS Admin
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Harga {product.name}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Tambah, ubah, atau hapus harga dari beberapa marketplace.
          </p>

          {query.error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {query.error}
            </div>
          )}

          {query.message && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
            >
              {query.message}
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black">
                    Daftar Harga
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {prices.length} marketplace tersimpan.
                  </p>
                </div>
              </div>

              {prices.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {prices.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <form action={savePrice} className="space-y-4">
                        <input
                          type="hidden"
                          name="product_id"
                          value={product.id}
                        />
                        <input
                          type="hidden"
                          name="price_id"
                          value={item.id}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-bold">
                              Marketplace
                            </label>
                            <select
                              name="marketplace_id"
                              defaultValue={item.marketplaceId}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                            >
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
                            <label className="text-xs font-bold">
                              Harga
                            </label>
                            <input
                              name="price"
                              type="number"
                              min="0"
                              step="1"
                              defaultValue={item.price}
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold">
                              Harga normal
                            </label>
                            <input
                              name="original_price"
                              type="number"
                              min="0"
                              step="1"
                              defaultValue={item.originalPrice}
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold">
                              Ongkir
                            </label>
                            <input
                              name="shipping_cost"
                              type="number"
                              min="0"
                              step="1"
                              defaultValue={item.shippingCost}
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold">
                              Status stok
                            </label>
                            <select
                              name="stock_status"
                              defaultValue={item.stockStatus}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                            >
                              <option value="in_stock">Tersedia</option>
                              <option value="low_stock">
                                Stok terbatas
                              </option>
                              <option value="out_of_stock">
                                Stok habis
                              </option>
                              <option value="preorder">Preorder</option>
                              <option value="unknown">
                                Tidak diketahui
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold">
                              Ketersediaan
                            </label>
                            <select
                              name="is_available"
                              defaultValue={String(item.isAvailable)}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                            >
                              <option value="true">Aktif</option>
                              <option value="false">Tidak aktif</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-xs font-bold">
                              Link toko
                            </label>
                            <input
                              name="affiliate_url"
                              type="url"
                              defaultValue={item.affiliateUrl}
                              placeholder="https://..."
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs text-slate-500">
                            Total saat ini:{" "}
                            <strong className="text-slate-800">
                              {formatRupiah(
                                item.price + item.shippingCost,
                              )}
                            </strong>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      </form>

                      <form action={deletePrice} className="mt-3">
                        <input
                          type="hidden"
                          name="product_id"
                          value={product.id}
                        />
                        <input
                          type="hidden"
                          name="price_id"
                          value={item.id}
                        />

                        <button
                          type="submit"
                          className="text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          Hapus harga ini
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-black">
                    Belum ada harga marketplace.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tambahkan harga pertama dari form di samping.
                  </p>
                </div>
              )}
            </section>

            <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-lg font-black">
                Tambah Harga Baru
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Satu produk dapat memiliki satu harga per marketplace.
              </p>

              <form action={savePrice} className="mt-5 space-y-4">
                <input
                  type="hidden"
                  name="product_id"
                  value={product.id}
                />

                <div>
                  <label className="text-sm font-bold">
                    Marketplace
                  </label>
                  <select
                    name="marketplace_id"
                    required
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="" disabled>
                      Pilih marketplace
                    </option>
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
                  <label className="text-sm font-bold">
                    Harga
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="250000"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Harga normal
                  </label>
                  <input
                    name="original_price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Opsional"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Ongkir
                  </label>
                  <input
                    name="shipping_cost"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue="0"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Status stok
                  </label>
                  <select
                    name="stock_status"
                    defaultValue="in_stock"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="in_stock">Tersedia</option>
                    <option value="low_stock">Stok terbatas</option>
                    <option value="out_of_stock">Stok habis</option>
                    <option value="preorder">Preorder</option>
                    <option value="unknown">Tidak diketahui</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Ketersediaan
                  </label>
                  <select
                    name="is_available"
                    defaultValue="true"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Tidak aktif</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Link toko
                  </label>
                  <input
                    name="affiliate_url"
                    type="url"
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Tambah Harga
                </button>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
