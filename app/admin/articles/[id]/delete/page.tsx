import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type DeleteArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

async function deleteArticle(formData: FormData) {
  "use server";

  const articleId = String(formData.get("article_id") ?? "").trim();

  if (!articleId) {
    redirect("/admin/articles?error=Artikel tidak valid.");
  }

  const supabase = await requireAdmin();

  const { data: article, error: readError } = await supabase
    .from("articles")
    .select("title")
    .eq("id", articleId)
    .maybeSingle();

  if (readError || !article) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(
        readError?.message ?? "Artikel tidak ditemukan.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (error) {
    redirect(
      `/admin/articles?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/admin/articles?deleted=${encodeURIComponent(
      `${article.title} berhasil dihapus.`,
    )}`,
  );
}

export default async function DeleteArticlePage({
  params,
}: DeleteArticlePageProps) {
  const { id } = await params;
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,published")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil artikel: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-bold text-red-600">
            Konfirmasi Hapus
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Hapus artikel?
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Artikel <strong>{data.title}</strong> akan dihapus permanen dari
            database. Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            /articles/{data.slug} · {data.published ? "Published" : "Draft"}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/articles"
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </Link>

            <form action={deleteArticle}>
              <input type="hidden" name="article_id" value={data.id} />

              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Hapus Permanen
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
