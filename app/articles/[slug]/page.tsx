import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  ArticleIcon,
  ClockIcon,
} from "@/components/home/home-icons";
import Breadcrumbs from "@/components/site/breadcrumbs";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getActiveSiteFooter } from "@/lib/footer";
import { sanitizePublicUrl, SITE_URL, toAbsoluteSiteUrl } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase";

export const revalidate = 3600;

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

type PublicArticle = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function estimateReadingTime(content: string) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

async function getArticle(slug: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("title,slug,excerpt,content,cover_image,created_at,updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil artikel: ${error.message}`);
  }
  if (!data) return null;

  const article = data as PublicArticle;
  return {
    ...article,
    cover_image: sanitizePublicUrl(article.cover_image, { allowHash: false }),
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Artikel tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description = article.excerpt ?? "Artikel dan panduan belanja dari BelanjaLab.";
  const canonicalPath = `/articles/${article.slug}`;
  const coverImage = article.cover_image ? toAbsoluteSiteUrl(article.cover_image) : null;

  return {
    title: article.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: canonicalPath,
      siteName: "BelanjaLab",
      locale: "id_ID",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      images: coverImage ? [{ url: coverImage, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, footer] = await Promise.all([
    getArticle(slug),
    getActiveSiteFooter(),
  ]);

  if (!article) notFound();

  const content = article.content?.trim() ?? "";
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const coverImage = article.cover_image ? toAbsoluteSiteUrl(article.cover_image) : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? "Artikel dan panduan belanja dari BelanjaLab.",
    url: articleUrl,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    inLanguage: "id-ID",
    author: { "@type": "Organization", name: "BelanjaLab", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "BelanjaLab",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    },
    ...(coverImage ? { image: [coverImage] } : {}),
  };

  return (
    <>
      <SiteHeader active="articles" />
      <main id="konten-utama" className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />

        <Breadcrumbs
          items={[
            { label: "Beranda", href: "/" },
            { label: "Artikel", href: "/articles" },
            { label: article.title },
          ]}
        />

        <article className="px-4 pb-14 pt-8 md:px-5 md:pb-20 md:pt-12">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-orange-800">
                <ArticleIcon className="h-4 w-4" /> Panduan Belanja
              </span>
              <h1 className="brand-text-balance mt-5 text-3xl font-extrabold leading-[1.1] tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  {article.excerpt}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                <span>{formatDate(article.created_at)}</span>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {estimateReadingTime(content)} menit baca
                </span>
              </div>
            </div>

            {article.cover_image && (
              <div className="public-card mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="article-content mx-auto mt-10 max-w-3xl">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={`${article.slug}-${index}`} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Isi artikel belum tersedia.
                </div>
              )}
            </div>

            <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/articles"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-700 hover:border-orange-300 hover:text-orange-800"
              >
                Artikel lainnya
              </Link>
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                Cari produk <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter footer={footer} />
      <MobileBottomNav active="articles" />
    </>
  );
}
