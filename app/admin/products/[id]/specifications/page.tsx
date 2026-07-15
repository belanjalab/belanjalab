import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAdminProductForEdit } from "@/lib/admin-product-edit";
import { getAdminProductSpecifications } from "@/lib/admin-product-specifications";

export const dynamic = "force-dynamic";

type ProductSpecificationsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}

function parseSortOrder(value: FormDataEntryValue | null) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.round(number));
}

async function saveSpecification(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "");
  const specificationId = String(
    formData.get("specification_id") ?? "",
  );
  const rawKey = String(formData.get("spec_key") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const valueText = String(formData.get("value_text") ?? "").trim();
  const sortOrder = parseSortOrder(formData.get("sort_order"));
  const specKey = normalizeKey(rawKey || label);

  if (!productId || !specKey || !label || !valueText) {
    redirect(
      `/admin/products/${productId}/specifications?error=${encodeURIComponent(
        "Key, label, dan nilai spesifikasi wajib diisi.",
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

  const payload = {
    product_id: productId,
    spec_key: specKey,
    label,
    value_text: valueText,
    sort_order: sortOrder,
  };

  if (specificationId) {
    const { error } = await supabase
      .from("product_specifications")
      .update(payload)
      .eq("id", specificationId);

    if (error) {
      redirect(
        `/admin/products/${productId}/specifications?error=${encodeURIComponent(
          error.message,
        )}`,
      );
    }
  } else {
    const { error } = await supabase
      .from("product_specifications")
      .insert(payload);

    if (error) {
      redirect(
        `/admin/products/${productId}/specifications?error=${encodeURIComponent(
          error.message,
        )}`,
      );
    }
  }

  redirect(
    `/admin/products/${productId}/specifications?message=${encodeURIComponent(
      "Spesifikasi berhasil disimpan.",
    )}`,
  );
}

async function deleteSpecification(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "");
  const specificationId = String(
    formData.get("specification_id") ?? "",
  );

  if (!productId || !specificationId) {
    redirect(`/admin/products/${productId}/specifications`);
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

  const { error } = await supabase
    .from("product_specifications")
    .delete()
    .eq("id", specificationId);

  if (error) {
    redirect(
      `/admin/products/${productId}/specifications?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(
    `/admin/products/${productId}/specifications?message=${encodeURIComponent(
      "Spesifikasi berhasil dihapus.",
    )}`,
  );
}

export default async function ProductSpecificationsPage({
  params,
  searchParams,
}: ProductSpecificationsPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const [product, specifications] = await Promise.all([
    getAdminProductForEdit(id),
    getAdminProductSpecifications(id),
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
                Belanja<span className="text-orange-500">Lab</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Spesifikasi Produk
              </p>
            </div>
          </Link>

          <Link
            href={`/admin/products/${product.id}/edit`}
            className="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Kembali ke Edit
          </Link>
        </div>
      </header>

      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            CMS Admin
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Spesifikasi {product.name}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Tambah, ubah, urutkan, atau hapus spesifikasi produk.
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
              <div>
                <h2 className="text-lg font-black">
                  Daftar Spesifikasi
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {specifications.length} spesifikasi tersimpan.
                </p>
              </div>

              {specifications.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {specifications.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <form action={saveSpecification} className="space-y-4">
                        <input
                          type="hidden"
                          name="product_id"
                          value={product.id}
                        />
                        <input
                          type="hidden"
                          name="specification_id"
                          value={item.id}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-bold">
                              Key
                            </label>
                            <input
                              name="spec_key"
                              defaultValue={item.key}
                              required
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold">
                              Label
                            </label>
                            <input
                              name="label"
                              defaultValue={item.label}
                              required
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold">
                              Nilai
                            </label>
                            <input
                              name="value_text"
                              defaultValue={item.value}
                              required
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold">
                              Urutan
                            </label>
                            <input
                              name="sort_order"
                              type="number"
                              min="0"
                              step="1"
                              defaultValue={item.sortOrder}
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-4">
                          <button
                            type="submit"
                            className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
                          >
                            Simpan
                          </button>
                        </div>
                      </form>

                      <form action={deleteSpecification} className="mt-3">
                        <input
                          type="hidden"
                          name="product_id"
                          value={product.id}
                        />
                        <input
                          type="hidden"
                          name="specification_id"
                          value={item.id}
                        />

                        <button
                          type="submit"
                          className="text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          Hapus spesifikasi ini
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-black">
                    Belum ada spesifikasi.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tambahkan spesifikasi pertama dari form di samping.
                  </p>
                </div>
              )}
            </section>

            <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-lg font-black">
                Tambah Spesifikasi
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Contoh key: sensor, connection, weight, warranty.
              </p>

              <form action={saveSpecification} className="mt-5 space-y-4">
                <input
                  type="hidden"
                  name="product_id"
                  value={product.id}
                />

                <div>
                  <label className="text-sm font-bold">
                    Key
                  </label>
                  <input
                    name="spec_key"
                    placeholder="sensor"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Label
                  </label>
                  <input
                    name="label"
                    required
                    placeholder="Sensor"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Nilai
                  </label>
                  <input
                    name="value_text"
                    required
                    placeholder="8.000 DPI"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Urutan
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue="0"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Tambah Spesifikasi
                </button>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
