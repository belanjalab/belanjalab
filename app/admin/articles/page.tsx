import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminArticlesPageProps = {
  searchParams: Promise<{
    created?: string;
    error?: string;
  }>;
};

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

async function createArticle(formData: FormData) {
  "use server";

  const title = String(formData.get("title") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || title);
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImage = String(formData.get("cover_image") ?? "").trim();
  const published = formData.get("published") === "on";

  if (title.length < 3 || title.length > 160) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(
        "Judul artikel harus 3-160 karakter.",
      )}`,
    );
  }

  if (slug.length < 3 || slug.length > 180) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(
        "Slug artikel harus 3-180 karakter.",
      )}`,
    );
  }

  if (excerpt.length > 500) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(
        "Excerpt maksimal 500 karakter.",
      )}`,
    );
  }

  if (content.length < 20) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(
        "Konten artikel minimal 20 karakter.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { data: duplicateArticle, error: duplicateError } = await supabase
    .from("articles")
    .select("id")
    .ilike("slug", slug)
    .maybeSingle();

  if (duplicateError) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(duplicateError.message)}`,
    );
  }

  if (duplicateArticle) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(
        "Slug artikel sudah digunakan.",
      )}`,
    );
  }

  const { error } = await supabase.from("articles").insert({
    title,
    slug,
    excerpt: excerpt || null,
    content,
    cover_image: coverImage || null,
    published,
  });

  if (error) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/admin/articles?created=${encodeURIComponent(
      `${title} berhasil ditambahkan.`,
    )}`,
  );
}

export default async function AdminArticlesPage({
  searchParams,
}: AdminArticlesPageProps) {
  const params = await searchParams;
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("articles")
    .select(
      "id,title,slug,excerpt,cover_image,published,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil artikel: ${error.message}`);
  }

  const articles = (data ?? []) as ArticleRow[];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Artikel
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola artikel yang tampil di Homepage dan halaman publik.
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

        {params.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {params.error}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Tambah Artikel
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Artikel baru dapat disimpan sebagai draft atau langsung dipublikasikan.
            </p>
          </div>

          <form action={createArticle} className="mt-5 grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Judul
                <input
                  type="text"
                  name="title"
                  required
                  minLength={3}
                  maxLength={160}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Slug
                <input
                  type="text"
                  name="slug"
                  maxLength={180}
                  placeholder="Otomatis dari judul jika dikosongkan"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Excerpt
              <textarea
                name="excerpt"
                maxLength={500}
                rows={3}
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Konten
              <textarea
                name="content"
                required
                minLength={20}
                rows={12}
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              URL cover image
              <input
                type="url"
                name="cover_image"
                placeholder="https://example.com/gambar-artikel.jpg"
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
              />
              <span className="text-xs font-medium text-slate-400">
                Gunakan link gambar publik. Tidak ada upload file langsung.
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                name="published"
                className="h-4 w-4 accent-orange-500"
              />
              Publikasikan artikel
            </label>

            <button
              type="submit"
              className="w-fit rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Simpan Artikel
            </button>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-black text-slate-900">
              Daftar Artikel
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {articles.length} artikel tersedia
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada artikel
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tambahkan artikel pertama lewat form di atas.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="grid gap-4 px-5 py-5 md:grid-cols-[96px_1fr_auto] md:items-center"
                >
                  <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[10px] font-bold text-slate-400">
                    {article.cover_image ? (
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "NO IMAGE"
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-black text-slate-900">
                        {article.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                          article.published
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      /articles/{article.slug}
                    </p>

                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {article.excerpt}
                      </p>
                    )}

                    <p className="mt-2 text-[10px] text-slate-400">
                      Dibuat {formatDate(article.created_at)}
                    </p>
                  </div>

                  <a
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  >
                    Lihat Artikel
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
