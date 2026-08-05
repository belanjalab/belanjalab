import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArticleIcon,
  ClockIcon,
} from "@/components/home/home-icons";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import PageIntro from "@/components/site/page-intro";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getActiveSiteFooter } from "@/lib/footer";
import { sanitizePublicUrl } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Artikel BelanjaLab",
  description:
    "Panduan, rekomendasi, dan insight produk untuk membantu keputusan belanja yang lebih cerdas.",
  alternates: { canonical: "/articles" },
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
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,cover_image,created_at,content")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil daftar artikel: ${error.message}`);
  }

  return ((data ?? []) as ArticleListItem[]).map((article) => ({
    ...article,
    cover_image: sanitizePublicUrl(article.cover_image, { allowHash: false }),
  }));
}

export default async function ArticlesPage() {
  const [articles, footer] = await Promise.all([
    getPublishedArticles(),
    getActiveSiteFooter(),
  ]);

  return (
    <>
      <SiteHeader active="articles" />
      <main id="konten-utama" className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">
        <PageIntro
          eyebrow="Insight belanja"
          title="Artikel dan panduan untuk memilih lebih yakin."
          description="Baca panduan, rekomendasi, dan penjelasan produk yang fokus pada keputusan belanja—bukan sekadar daftar spesifikasi."
          compact
        />

        <section className="px-4 pb-12 md:px-5 md:pb-16">
          <div className="mx-auto max-w-7xl">
            {articles.length === 0 ? (
              <div className="public-card rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                  <ArticleIcon className="h-7 w-7" />
                </span>
                <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                  Artikel sedang disiapkan
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Artikel yang sudah dipublikasikan akan muncul otomatis di halaman ini.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="public-card group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg"
                  >
                    <Link
                      href={`/articles/${article.slug}`}
                      aria-label={`Baca artikel ${article.title}`}
                      className="block h-full focus-visible:outline-none"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-slate-50 ring-1 ring-inset ring-slate-100">
                        {article.cover_image ? (
                          <img
                            src={article.cover_image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                            <ArticleIcon className="h-8 w-8" />
                            <span className="text-xs font-bold">Gambar belum tersedia</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                          <span>{formatDate(article.created_at)}</span>
                          <span aria-hidden="true">•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {estimateReadingTime(article.content)} menit baca
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-extrabold leading-7 tracking-[-0.025em] text-slate-950 transition-colors group-hover:text-orange-800">
                          {article.title}
                        </h2>

                        {article.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {article.excerpt}
                          </p>
                        )}

                        <span className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-bold text-orange-700 transition-colors group-hover:text-orange-800">
                          Baca artikel <ArrowRightIcon />
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter footer={footer} />
      <MobileBottomNav active="articles" />
    </>
  );
}
