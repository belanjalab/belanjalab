import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminHeroPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

type ProductOption = {
  id: string;
  name: string;
  slug: string;
};

type HeroRecord = {
  id: string;
  title: string;
  subtitle: string | null;
  primary_button_text: string | null;
  primary_button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  hero_image_url: string | null;
  featured_product_id: string | null;
  is_active: boolean;
  sort_order: number;
};

function normalizeInternalUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? "").trim();

  if (!url) {
    return null;
  }

  if (!url.startsWith("/") || url.startsWith("//")) {
    throw new Error("URL tombol harus berupa path internal yang diawali /.");
  }

  return url;
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

async function saveHero(formData: FormData) {
  "use server";

  const heroId = String(formData.get("hero_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const primaryButtonText =
    String(formData.get("primary_button_text") ?? "").trim() || null;
  const secondaryButtonText =
    String(formData.get("secondary_button_text") ?? "").trim() || null;
  const heroImageUrl =
    String(formData.get("hero_image_url") ?? "").trim() || null;
  const featuredProductId =
    String(formData.get("featured_product_id") ?? "").trim() || null;
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const isActive = formData.get("is_active") === "on";

  if (title.length < 3 || title.length > 120) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        "Judul Hero harus 3-120 karakter.",
      )}`,
    );
  }

  if (subtitle && subtitle.length > 300) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        "Subtitle Hero maksimal 300 karakter.",
      )}`,
    );
  }

  if (primaryButtonText && primaryButtonText.length > 40) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        "Teks tombol utama maksimal 40 karakter.",
      )}`,
    );
  }

  if (secondaryButtonText && secondaryButtonText.length > 40) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        "Teks tombol sekunder maksimal 40 karakter.",
      )}`,
    );
  }

  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        "Urutan Hero harus berupa angka 0-9999.",
      )}`,
    );
  }

  let primaryButtonUrl: string | null;
  let secondaryButtonUrl: string | null;

  try {
    primaryButtonUrl = normalizeInternalUrl(
      formData.get("primary_button_url"),
    );
    secondaryButtonUrl = normalizeInternalUrl(
      formData.get("secondary_button_url"),
    );
  } catch (error) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        error instanceof Error ? error.message : "URL tombol tidak valid.",
      )}`,
    );
  }

  if (
    (primaryButtonText && !primaryButtonUrl) ||
    (!primaryButtonText && primaryButtonUrl)
  ) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        "Teks dan URL tombol utama harus diisi bersama.",
      )}`,
    );
  }

  if (
    (secondaryButtonText && !secondaryButtonUrl) ||
    (!secondaryButtonText && secondaryButtonUrl)
  ) {
    redirect(
      `/admin/hero?error=${encodeURIComponent(
        "Teks dan URL tombol sekunder harus diisi bersama.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  if (isActive) {
    const deactivateQuery = supabase
      .from("hero_sections")
      .update({ is_active: false })
      .eq("is_active", true);

    if (heroId) {
      deactivateQuery.neq("id", heroId);
    }

    const { error: deactivateError } = await deactivateQuery;

    if (deactivateError) {
      redirect(
        `/admin/hero?error=${encodeURIComponent(deactivateError.message)}`,
      );
    }
  }

  const payload = {
    title,
    subtitle,
    primary_button_text: primaryButtonText,
    primary_button_url: primaryButtonUrl,
    secondary_button_text: secondaryButtonText,
    secondary_button_url: secondaryButtonUrl,
    hero_image_url: heroImageUrl,
    featured_product_id: featuredProductId,
    is_active: isActive,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };

  const { error } = heroId
    ? await supabase.from("hero_sections").update(payload).eq("id", heroId)
    : await supabase.from("hero_sections").insert(payload);

  if (error) {
    redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/admin/hero?saved=${encodeURIComponent(
      heroId ? "Hero berhasil diperbarui." : "Hero berhasil dibuat.",
    )}`,
  );
}

export default async function AdminHeroPage({
  searchParams,
}: AdminHeroPageProps) {
  const params = await searchParams;
  const supabase = await requireAdmin();

  const [{ data: heroes, error: heroesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase
        .from("hero_sections")
        .select(
          "id,title,subtitle,primary_button_text,primary_button_url,secondary_button_text,secondary_button_url,hero_image_url,featured_product_id,is_active,sort_order",
        )
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false }),
      supabase
        .from("products")
        .select("id,name,slug")
        .eq("status", "published")
        .order("name", { ascending: true }),
    ]);

  if (heroesError) {
    throw new Error(`Gagal mengambil data Hero: ${heroesError.message}`);
  }

  if (productsError) {
    throw new Error(`Gagal mengambil daftar produk: ${productsError.message}`);
  }

  const heroRecords = (heroes ?? []) as HeroRecord[];
  const productOptions = (products ?? []) as ProductOption[];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Hero Homepage
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola konten Hero yang tampil pada Homepage.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        {params.saved && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {params.saved}
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
              Tambah Hero
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Hanya satu Hero yang dapat aktif pada satu waktu.
            </p>
          </div>

          <form action={saveHero} className="mt-5 grid gap-4">
            <input type="hidden" name="hero_id" value="" />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Judul
                <input
                  type="text"
                  name="title"
                  required
                  minLength={3}
                  maxLength={120}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Produk pilihan
                <select
                  name="featured_product_id"
                  defaultValue=""
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none focus:border-orange-400"
                >
                  <option value="">Tanpa produk pilihan</option>
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Subtitle
              <textarea
                name="subtitle"
                maxLength={300}
                rows={3}
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              URL gambar Hero
              <input
                type="text"
                name="hero_image_url"
                placeholder="/images/hero/produk.webp"
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Teks tombol utama
                <input
                  type="text"
                  name="primary_button_text"
                  maxLength={40}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                URL tombol utama
                <input
                  type="text"
                  name="primary_button_url"
                  placeholder="/search"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Teks tombol sekunder
                <input
                  type="text"
                  name="secondary_button_text"
                  maxLength={40}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                URL tombol sekunder
                <input
                  type="text"
                  name="secondary_button_url"
                  placeholder="/compare"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-end">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Urutan
                <input
                  type="number"
                  name="sort_order"
                  min={0}
                  max={9999}
                  defaultValue={0}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  name="is_active"
                  className="h-4 w-4 accent-orange-500"
                />
                Aktifkan Hero ini
              </label>
            </div>

            <button
              type="submit"
              className="w-fit rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Simpan Hero
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-black text-slate-900">
              Daftar Hero
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {heroRecords.length} Hero tersedia
            </p>
          </div>

          {heroRecords.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada Hero
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tambahkan Hero pertama lewat form di atas.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {heroRecords.map((hero) => (
                <form
                  key={hero.id}
                  action={saveHero}
                  className="grid gap-4 px-5 py-5"
                >
                  <input type="hidden" name="hero_id" value={hero.id} />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {hero.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        ID: {hero.id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                        hero.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {hero.is_active ? "Aktif" : "Draft"}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Judul
                      <input
                        type="text"
                        name="title"
                        required
                        minLength={3}
                        maxLength={120}
                        defaultValue={hero.title}
                        className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Produk pilihan
                      <select
                        name="featured_product_id"
                        defaultValue={hero.featured_product_id ?? ""}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none focus:border-orange-400"
                      >
                        <option value="">Tanpa produk pilihan</option>
                        {productOptions.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Subtitle
                    <textarea
                      name="subtitle"
                      maxLength={300}
                      rows={3}
                      defaultValue={hero.subtitle ?? ""}
                      className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    URL gambar Hero
                    <input
                      type="text"
                      name="hero_image_url"
                      defaultValue={hero.hero_image_url ?? ""}
                      className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Teks tombol utama
                      <input
                        type="text"
                        name="primary_button_text"
                        maxLength={40}
                        defaultValue={hero.primary_button_text ?? ""}
                        className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      URL tombol utama
                      <input
                        type="text"
                        name="primary_button_url"
                        defaultValue={hero.primary_button_url ?? ""}
                        className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Teks tombol sekunder
                      <input
                        type="text"
                        name="secondary_button_text"
                        maxLength={40}
                        defaultValue={hero.secondary_button_text ?? ""}
                        className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      URL tombol sekunder
                      <input
                        type="text"
                        name="secondary_button_url"
                        defaultValue={hero.secondary_button_url ?? ""}
                        className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Urutan
                      <input
                        type="number"
                        name="sort_order"
                        min={0}
                        max={9999}
                        defaultValue={hero.sort_order}
                        className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                      />
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={hero.is_active}
                        className="h-4 w-4 accent-orange-500"
                      />
                      Aktifkan Hero ini
                    </label>

                    <button
                      type="submit"
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
