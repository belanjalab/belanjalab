import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAdminTaxonomies } from "@/lib/admin-taxonomies";

export const dynamic = "force-dynamic";

type TaxonomyPageProps = {
  searchParams: Promise<{
    success?: string;
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
    .slice(0, 100);
}

async function requireAdmin() {
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

  return supabase;
}

function refreshTaxonomyPaths() {
  revalidatePath("/admin/taxonomies");
  revalidatePath("/admin/products/new");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/search");
}

async function createCategory(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  if (!name || !slug) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Nama kategori wajib diisi.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
  });

  if (error) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(error.message)}`,
    );
  }

  refreshTaxonomyPaths();

  redirect(
    `/admin/taxonomies?success=${encodeURIComponent(
      `Kategori “${name}” berhasil ditambahkan.`,
    )}`,
  );
}

async function updateCategory(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  if (!id || !name || !slug) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Data kategori tidak valid.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(error.message)}`,
    );
  }

  refreshTaxonomyPaths();

  redirect(
    `/admin/taxonomies?success=${encodeURIComponent(
      `Kategori “${name}” berhasil diperbarui.`,
    )}`,
  );
}

async function createBrand(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  if (!name || !slug) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Nama merek wajib diisi.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { error } = await supabase.from("brands").insert({
    name,
    slug,
  });

  if (error) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(error.message)}`,
    );
  }

  refreshTaxonomyPaths();

  redirect(
    `/admin/taxonomies?success=${encodeURIComponent(
      `Merek “${name}” berhasil ditambahkan.`,
    )}`,
  );
}

async function updateBrand(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  if (!id || !name || !slug) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Data merek tidak valid.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("brands")
    .update({
      name,
      slug,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(error.message)}`,
    );
  }

  refreshTaxonomyPaths();

  redirect(
    `/admin/taxonomies?success=${encodeURIComponent(
      `Merek “${name}” berhasil diperbarui.`,
    )}`,
  );
}

async function deleteCategory(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");

  if (!id) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Kategori tidak valid.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Kategori tidak dapat dihapus. Pastikan belum dipakai oleh produk.",
      )}`,
    );
  }

  refreshTaxonomyPaths();

  redirect(
    `/admin/taxonomies?success=${encodeURIComponent(
      `Kategori “${name}” berhasil dihapus.`,
    )}`,
  );
}

async function deleteBrand(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");

  if (!id) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Merek tidak valid.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/taxonomies?error=${encodeURIComponent(
        "Merek tidak dapat dihapus. Pastikan belum dipakai oleh produk.",
      )}`,
    );
  }

  refreshTaxonomyPaths();

  redirect(
    `/admin/taxonomies?success=${encodeURIComponent(
      `Merek “${name}” berhasil dihapus.`,
    )}`,
  );
}

export default async function TaxonomiesPage({
  searchParams,
}: TaxonomyPageProps) {
  const params = await searchParams;
  const { categories, brands } = await getAdminTaxonomies();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 md:px-6">
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
                Kategori & Merek
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
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            CMS Admin
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Kelola Kategori & Merek
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Tambah, edit, dan hapus data yang dipakai pada dropdown produk dan pencarian.
          </p>

          {params.success && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
            >
              {params.success}
            </div>
          )}

          {params.error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {params.error}
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div>
                <h2 className="text-xl font-black">Kategori</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {categories.length} kategori tersedia
                </p>
              </div>

              <form
                action={createCategory}
                className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  name="name"
                  required
                  placeholder="Nama kategori"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <input
                  name="slug"
                  placeholder="Slug otomatis"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Tambah
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {categories.map((category) => (
                  <article
                    key={category.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <form
                      action={updateCategory}
                      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <input type="hidden" name="id" value={category.id} />

                      <input
                        name="name"
                        required
                        defaultValue={category.name}
                        aria-label={`Nama kategori ${category.name}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                      />

                      <input
                        name="slug"
                        required
                        defaultValue={category.slug}
                        aria-label={`Slug kategori ${category.name}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                      />

                      <button
                        type="submit"
                        className="rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Simpan
                      </button>
                    </form>

                    <form action={deleteCategory} className="mt-3 text-right">
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="name" value={category.name} />

                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Hapus kategori
                      </button>
                    </form>
                  </article>
                ))}

                {categories.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Belum ada kategori.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div>
                <h2 className="text-xl font-black">Merek</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {brands.length} merek tersedia
                </p>
              </div>

              <form
                action={createBrand}
                className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  name="name"
                  required
                  placeholder="Nama merek"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <input
                  name="slug"
                  placeholder="Slug otomatis"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Tambah
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {brands.map((brand) => (
                  <article
                    key={brand.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <form
                      action={updateBrand}
                      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <input type="hidden" name="id" value={brand.id} />

                      <input
                        name="name"
                        required
                        defaultValue={brand.name}
                        aria-label={`Nama merek ${brand.name}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                      />

                      <input
                        name="slug"
                        required
                        defaultValue={brand.slug}
                        aria-label={`Slug merek ${brand.name}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                      />

                      <button
                        type="submit"
                        className="rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Simpan
                      </button>
                    </form>

                    <form action={deleteBrand} className="mt-3 text-right">
                      <input type="hidden" name="id" value={brand.id} />
                      <input type="hidden" name="name" value={brand.name} />

                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Hapus merek
                      </button>
                    </form>
                  </article>
                ))}

                {brands.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Belum ada merek.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
