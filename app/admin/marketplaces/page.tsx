import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminMarketplaces } from "@/lib/admin-marketplaces";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminMarketplacesPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

async function createMarketplace(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Nama marketplace minimal 2 karakter.",
      )}`,
    );
  }

  if (name.length > 80) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Nama marketplace maksimal 80 karakter.",
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

  const { data: existingMarketplace, error: existingError } =
    await supabase
      .from("marketplaces")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

  if (existingError) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        existingError.message,
      )}`,
    );
  }

  if (existingMarketplace) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Marketplace dengan nama tersebut sudah ada.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("marketplaces")
    .insert({ name });

  if (error) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/admin/marketplaces?created=${encodeURIComponent(
      `${name} berhasil ditambahkan.`,
    )}`,
  );
}


async function updateMarketplace(formData: FormData) {
  "use server";

  const marketplaceId = String(
    formData.get("marketplace_id") ?? "",
  ).trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!marketplaceId) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Marketplace tidak valid.",
      )}`,
    );
  }

  if (name.length < 2) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Nama marketplace minimal 2 karakter.",
      )}`,
    );
  }

  if (name.length > 80) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Nama marketplace maksimal 80 karakter.",
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

  const { data: duplicateMarketplace, error: duplicateError } =
    await supabase
      .from("marketplaces")
      .select("id")
      .ilike("name", name)
      .neq("id", marketplaceId)
      .maybeSingle();

  if (duplicateError) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        duplicateError.message,
      )}`,
    );
  }

  if (duplicateMarketplace) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Marketplace dengan nama tersebut sudah ada.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("marketplaces")
    .update({ name })
    .eq("id", marketplaceId);

  if (error) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/admin/marketplaces?updated=${encodeURIComponent(
      `${name} berhasil diperbarui.`,
    )}`,
  );
}


async function deleteMarketplace(formData: FormData) {
  "use server";

  const marketplaceId = String(
    formData.get("marketplace_id") ?? "",
  ).trim();

  if (!marketplaceId) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        "Marketplace tidak valid.",
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

  const { data: marketplaceRecord, error: marketplaceError } =
    await supabase
      .from("marketplaces")
      .select("id, name")
      .eq("id", marketplaceId)
      .maybeSingle();

  if (marketplaceError || !marketplaceRecord) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        marketplaceError?.message ?? "Marketplace tidak ditemukan.",
      )}`,
    );
  }

  const { count, error: usageError } = await supabase
    .from("product_prices")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("marketplace_id", marketplaceId);

  if (usageError) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        usageError.message,
      )}`,
    );
  }

  if ((count ?? 0) > 0) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        `${marketplaceRecord.name} masih dipakai oleh ${count} data harga produk dan tidak dapat dihapus.`,
      )}`,
    );
  }

  const { error: deleteError } = await supabase
    .from("marketplaces")
    .delete()
    .eq("id", marketplaceId);

  if (deleteError) {
    redirect(
      `/admin/marketplaces?error=${encodeURIComponent(
        deleteError.message,
      )}`,
    );
  }

  redirect(
    `/admin/marketplaces?deleted=${encodeURIComponent(
      `${marketplaceRecord.name} berhasil dihapus.`,
    )}`,
  );
}

export default async function AdminMarketplacesPage({
  searchParams,
}: AdminMarketplacesPageProps) {
  const params = await searchParams;
  const marketplaces = await getAdminMarketplaces();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Marketplace
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola marketplace yang tersedia untuk harga produk.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        {params.created && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {params.created}
          </div>
        )}

        {params.updated && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
            {params.updated}
          </div>
        )}

        {params.deleted && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {params.deleted}
          </div>
        )}

        {params.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {params.error}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Tambah Marketplace
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Nama marketplace akan tersedia di form harga produk dan bulk action.
            </p>
          </div>

          <form
            action={createMarketplace}
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
          >
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={80}
              placeholder="Contoh: Tokopedia"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
            />

            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Tambah Marketplace
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Daftar Marketplace
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {marketplaces.length} marketplace tersedia
              </p>
            </div>
          </div>

          {marketplaces.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada marketplace
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tambahkan marketplace pertama lewat form di atas.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {marketplaces.map((marketplace, index) => (
                <div
                  key={marketplace.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[auto_1fr_auto]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-600">
                    {index + 1}
                  </div>

                  <form
                    action={updateMarketplace}
                    className="grid gap-3 sm:grid-cols-[1fr_auto]"
                  >
                    <input
                      type="hidden"
                      name="marketplace_id"
                      value={marketplace.id}
                    />

                    <div>
                      <input
                        type="text"
                        name="name"
                        required
                        minLength={2}
                        maxLength={80}
                        defaultValue={marketplace.name}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-400"
                      />
                      <p className="mt-1 truncate text-xs text-slate-400">
                        ID: {marketplace.id}
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Simpan
                    </button>
                  </form>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                    <span className="h-fit rounded-full bg-green-50 px-3 py-1 text-center text-xs font-bold text-green-700">
                      Aktif
                    </span>

                    <form action={deleteMarketplace}>
                      <input
                        type="hidden"
                        name="marketplace_id"
                        value={marketplace.id}
                      />

                      <button
                        type="submit"
                        className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
