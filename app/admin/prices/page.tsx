import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminPricesPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
};

type ProductRelation = {
  id: string;
  name: string;
  slug: string;
};

type MarketplaceRelation = {
  id: string;
  name: string;
};

type ProductPriceRow = {
  id: string;
  price: number | string | null;
  original_price: number | string | null;
  shipping_cost: number | string | null;
  affiliate_url: string | null;
  is_available: boolean | null;
  stock_status: string | null;
  last_checked_at: string | null;
  updated_at: string | null;
  products?: ProductRelation[] | ProductRelation | null;
  marketplaces?: MarketplaceRelation[] | MarketplaceRelation | null;
};

function firstRelation<T>(
  value: T[] | T | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Belum pernah dicek";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRecord) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        error?.message ?? "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }

  return supabase;
}

async function updateProductPrice(formData: FormData) {
  "use server";

  const priceId = String(formData.get("price_id") ?? "").trim();
  const productName = String(
    formData.get("product_name") ?? "Produk",
  ).trim();
  const price = Number(formData.get("price") ?? 0);
  const originalPrice = Number(
    formData.get("original_price") ?? price,
  );
  const shippingCost = Number(
    formData.get("shipping_cost") ?? 0,
  );
  const affiliateUrl = String(
    formData.get("affiliate_url") ?? "",
  ).trim();
  const stockStatus = String(
    formData.get("stock_status") ?? "in_stock",
  );
  const isAvailable = formData.get("is_available") === "on";

  if (!priceId) {
    redirect(
      `/admin/prices?error=${encodeURIComponent(
        "Data harga tidak valid.",
      )}`,
    );
  }

  if (!Number.isFinite(price) || price <= 0) {
    redirect(
      `/admin/prices?error=${encodeURIComponent(
        "Harga harus lebih dari 0.",
      )}`,
    );
  }

  if (!Number.isFinite(originalPrice) || originalPrice < price) {
    redirect(
      `/admin/prices?error=${encodeURIComponent(
        "Harga normal tidak boleh lebih kecil dari harga saat ini.",
      )}`,
    );
  }

  if (!Number.isFinite(shippingCost) || shippingCost < 0) {
    redirect(
      `/admin/prices?error=${encodeURIComponent(
        "Ongkos kirim tidak valid.",
      )}`,
    );
  }

  if (
    !["in_stock", "out_of_stock", "preorder"].includes(stockStatus)
  ) {
    redirect(
      `/admin/prices?error=${encodeURIComponent(
        "Status stok tidak valid.",
      )}`,
    );
  }

  if (affiliateUrl) {
    try {
      const parsedUrl = new URL(affiliateUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      redirect(
        `/admin/prices?error=${encodeURIComponent(
          "URL affiliate harus berupa URL http atau https.",
        )}`,
      );
    }
  }

  const supabase = await requireAdmin();
  const now = new Date().toISOString();
  const roundedPrice = Math.round(price);

  const { data: currentPriceRow, error: currentPriceError } =
    await supabase
      .from("product_prices")
      .select("price")
      .eq("id", priceId)
      .maybeSingle();

  if (currentPriceError || !currentPriceRow) {
    redirect(
      `/admin/prices?error=${encodeURIComponent(
        currentPriceError?.message ?? "Data harga tidak ditemukan.",
      )}`,
    );
  }

  const previousPrice = Number(currentPriceRow.price);

  const { error } = await supabase
    .from("product_prices")
    .update({
      price: roundedPrice,
      original_price: Math.round(originalPrice),
      shipping_cost: Math.round(shippingCost),
      affiliate_url: affiliateUrl || "#",
      is_available: isAvailable,
      stock_status: stockStatus,
      last_checked_at: now,
      updated_at: now,
    })
    .eq("id", priceId);

  if (error) {
    redirect(
      `/admin/prices?error=${encodeURIComponent(error.message)}`,
    );
  }

  if (Number.isFinite(previousPrice) && previousPrice !== roundedPrice) {
    const { count, error: historyCountError } = await supabase
      .from("product_price_history")
      .select("product_price_id", {
        count: "exact",
        head: true,
      })
      .eq("product_price_id", priceId);

    if (historyCountError) {
      redirect(
        `/admin/prices?error=${encodeURIComponent(
          `Harga berhasil diperbarui, tetapi riwayat gagal diperiksa: ${historyCountError.message}`,
        )}`,
      );
    }

    const historyEntries = [];

    if ((count ?? 0) === 0) {
      historyEntries.push({
        product_price_id: priceId,
        price: previousPrice,
        captured_at: new Date(
          new Date(now).getTime() - 1000,
        ).toISOString(),
      });
    }

    historyEntries.push({
      product_price_id: priceId,
      price: roundedPrice,
      captured_at: now,
    });

    const { error: historyError } = await supabase
      .from("product_price_history")
      .insert(historyEntries);

    if (historyError) {
      redirect(
        `/admin/prices?error=${encodeURIComponent(
          `Harga berhasil diperbarui, tetapi riwayat gagal disimpan: ${historyError.message}`,
        )}`,
      );
    }
  }

  redirect(
    `/admin/prices?updated=${encodeURIComponent(
      previousPrice !== roundedPrice
        ? `Harga ${productName} berhasil diperbarui dan riwayat harga dicatat.`
        : `Data ${productName} berhasil diperbarui tanpa perubahan harga.`,
    )}`,
  );
}

export default async function AdminPricesPage({
  searchParams,
}: AdminPricesPageProps) {
  const params = await searchParams;
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("product_prices")
    .select(`
      id,
      price,
      original_price,
      shipping_cost,
      affiliate_url,
      is_available,
      stock_status,
      last_checked_at,
      updated_at,
      products (
        id,
        name,
        slug
      ),
      marketplaces (
        id,
        name
      )
    `)
    .order("updated_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(100);

  if (error) {
    throw new Error(`Gagal mengambil harga marketplace: ${error.message}`);
  }

  const prices = (data ?? []) as unknown as ProductPriceRow[];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Harga Marketplace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Perbarui harga, stok, ketersediaan, dan waktu pengecekan terakhir
              tanpa mengubah data utama produk.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/marketplaces"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Kelola Marketplace
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        {params.updated && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {params.updated}
          </div>
        )}

        {params.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {params.error}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-black text-slate-900">
              Daftar Harga
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Menampilkan maksimal 100 data harga terbaru.
            </p>
          </div>

          {prices.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada data harga marketplace.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tambahkan harga melalui form produk atau Bulk Product Import.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {prices.map((item) => {
                const product = firstRelation(item.products);
                const marketplace = firstRelation(item.marketplaces);

                return (
                  <form
                    key={item.id}
                    action={updateProductPrice}
                    className="grid gap-4 px-5 py-5 xl:grid-cols-[1.25fr_1fr_1fr_1fr_1fr_1.2fr_auto] xl:items-end"
                  >
                    <input type="hidden" name="price_id" value={item.id} />
                    <input
                      type="hidden"
                      name="product_name"
                      value={product?.name ?? "Produk"}
                    />

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {product?.name ?? "Produk tidak ditemukan"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {marketplace?.name ?? "Marketplace tidak ditemukan"}
                      </p>
                      <p className="mt-2 text-[10px] text-slate-400">
                        Dicek: {formatDate(item.last_checked_at)}
                      </p>
                    </div>

                    <label className="grid gap-2 text-xs font-bold text-slate-600">
                      Harga saat ini
                      <input
                        type="number"
                        name="price"
                        min="1"
                        step="1"
                        required
                        defaultValue={Number(item.price ?? 0)}
                        className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-bold text-slate-600">
                      Harga normal
                      <input
                        type="number"
                        name="original_price"
                        min="1"
                        step="1"
                        required
                        defaultValue={Number(
                          item.original_price ?? item.price ?? 0,
                        )}
                        className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-bold text-slate-600">
                      Ongkir
                      <input
                        type="number"
                        name="shipping_cost"
                        min="0"
                        step="1"
                        defaultValue={Number(item.shipping_cost ?? 0)}
                        className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-bold text-slate-600">
                      Status stok
                      <select
                        name="stock_status"
                        defaultValue={item.stock_status ?? "in_stock"}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400"
                      >
                        <option value="in_stock">Tersedia</option>
                        <option value="out_of_stock">Habis</option>
                        <option value="preorder">Preorder</option>
                      </select>
                    </label>

                    <div className="grid gap-3">
                      <label className="grid gap-2 text-xs font-bold text-slate-600">
                        URL affiliate
                        <input
                          type="url"
                          name="affiliate_url"
                          defaultValue={
                            item.affiliate_url === "#"
                              ? ""
                              : item.affiliate_url ?? ""
                          }
                          placeholder="https://..."
                          className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
                        />
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          name="is_available"
                          defaultChecked={item.is_available !== false}
                          className="h-4 w-4 accent-orange-500"
                        />
                        Tampilkan sebagai tersedia
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
                    >
                      Sync Manual
                    </button>
                  </form>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
