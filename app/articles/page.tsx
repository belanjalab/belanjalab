import type { Metadata } from "next";
import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artikel BelanjaLab",
  description:
    "Panduan, rekomendasi, dan insight produk untuk membantu keputusan belanja yang lebih cerdas.",
};

type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  created_at: string;
  content: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function estimateReadingTime(content: string | null) {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function getPublishedArticles() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,cover_image,created_at,content")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil daftar artikel: ${error.message}`);
  }

  return (data ?? []) as ArticleListItem[];
}

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-9 w-9 rounded-full object-cover"
            />
            <p className="text-sm font-black">
              Belanja<span className="text-orange-500">Lab</span>
            </p>
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500"
          >
            Kembali ke Homepage
          </Link>
        </div>
      </header>

      <section className="px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
              Insight Belanja
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Artikel & Panduan Belanja
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-500">
              Temukan panduan, rekomendasi, dan insight produk untuk membantu
              keputusan belanja yang lebih cerdas.
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm font-black">
                Belum ada artikel yang dipublikasikan.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Artikel published akan muncul otomatis di halaman ini.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Link href={`/articles/${article.slug}`}>
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      {article.cover_image ? (
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                          NO IMAGE
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                      <span>{formatDate(article.created_at)}</span>
                      <span>•</span>
                      <span>{estimateReadingTime(article.content)} menit baca</span>
                    </div>

                    <h2 className="mt-3 text-xl font-black leading-7">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="hover:text-orange-500"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    {article.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {article.excerpt}
                      </p>
                    )}

                    <Link
                      href={`/articles/${article.slug}`}
                      className="mt-5 inline-flex text-sm font-black text-orange-500 hover:text-orange-600"
                    >
                      Baca artikel →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
