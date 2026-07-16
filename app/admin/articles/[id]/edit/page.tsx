import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { deleteArticleImageByUrl, uploadArticleImage } from "@/lib/article-image-upload";

export const dynamic = "force-dynamic";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

type ArticleRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published: boolean;
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

async function updateArticle(formData: FormData) {
  "use server";

  const articleId = String(formData.get("article_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || title);
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverFile = formData.get("cover_file");
  const removeCover = formData.get("remove_cover") === "on";
  const currentCoverImage = String(
    formData.get("current_cover_image") ?? "",
  ).trim();
  const published = formData.get("published") === "on";

  if (!articleId) {
    redirect("/admin/articles?error=Artikel tidak valid.");
  }

  if (title.length < 3 || title.length > 160) {
    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        "Judul artikel harus 3-160 karakter.",
      )}`,
    );
  }

  if (slug.length < 3 || slug.length > 180) {
    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        "Slug artikel harus 3-180 karakter.",
      )}`,
    );
  }

  if (excerpt.length > 500) {
    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        "Excerpt maksimal 500 karakter.",
      )}`,
    );
  }

  if (content.length < 20) {
    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        "Konten artikel minimal 20 karakter.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { data: duplicateArticle, error: duplicateError } = await supabase
    .from("articles")
    .select("id")
    .ilike("slug", slug)
    .neq("id", articleId)
    .maybeSingle();

  if (duplicateError) {
    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        duplicateError.message,
      )}`,
    );
  }

  if (duplicateArticle) {
    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        "Slug artikel sudah digunakan.",
      )}`,
    );
  }

  let uploadedCover:
    | {
        publicUrl: string;
        path: string;
      }
    | null = null;

  if (coverFile instanceof File && coverFile.size > 0) {
    const uploadResult = await uploadArticleImage(coverFile, slug);

    if (!uploadResult.ok) {
      redirect(
        `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
          uploadResult.error,
        )}`,
      );
    }

    uploadedCover = {
      publicUrl: uploadResult.publicUrl,
      path: uploadResult.path,
    };
  }

  const nextCoverImage = uploadedCover
    ? uploadedCover.publicUrl
    : removeCover
      ? null
      : currentCoverImage || null;

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      cover_image: nextCoverImage,
      published,
    })
    .eq("id", articleId);

  if (error) {
    if (uploadedCover) {
      await deleteArticleImageByUrl(uploadedCover.publicUrl);
    }

    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  if (
    currentCoverImage &&
    (removeCover || uploadedCover) &&
    currentCoverImage !== nextCoverImage
  ) {
    await deleteArticleImageByUrl(currentCoverImage);
  }

  redirect(
    `/admin/articles?updated=${encodeURIComponent(
      `${title} berhasil diperbarui.`,
    )}`,
  );
}

export default async function EditArticlePage({
  params,
  searchParams,
}: EditArticlePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,content,cover_image,published")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil artikel: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const article = data as ArticleRecord;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Edit Artikel
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Perbarui isi, status publikasi, dan cover artikel.
            </p>
          </div>

          <Link
            href="/admin/articles"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Kembali
          </Link>
        </div>

        {query.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {query.error}
          </div>
        )}

        <form
          action={updateArticle}
          encType="multipart/form-data"
          className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
        >
          <input type="hidden" name="article_id" value={article.id} />
          <input
            type="hidden"
            name="current_cover_image"
            value={article.cover_image ?? ""}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Judul
              <input
                type="text"
                name="title"
                required
                minLength={3}
                maxLength={160}
                defaultValue={article.title}
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Slug
              <input
                type="text"
                name="slug"
                required
                maxLength={180}
                defaultValue={article.slug}
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
              defaultValue={article.excerpt ?? ""}
              className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Konten
            <textarea
              name="content"
              required
              minLength={20}
              rows={16}
              defaultValue={article.content ?? ""}
              className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Ganti cover artikel
            <input
              type="file"
              name="cover_file"
              accept="image/jpeg,image/png,image/webp"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-orange-600"
            />
            <span className="text-xs font-medium text-slate-400">
              Kosongkan jika tidak ingin mengganti cover. Maksimal 5 MB.
            </span>
          </label>

          {article.cover_image && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={article.cover_image}
                alt={article.title}
                className="h-56 w-full object-cover"
              />
            </div>
          )}

          {article.cover_image && (
            <label className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <input
                type="checkbox"
                name="remove_cover"
                className="h-4 w-4 accent-red-600"
              />
              Hapus cover saat menyimpan
            </label>
          )}

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              name="published"
              defaultChecked={article.published}
              className="h-4 w-4 accent-orange-500"
            />
            Publikasikan artikel
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              href={`/articles/${article.slug}`}
              target="_blank"
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
            >
              Preview Artikel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
