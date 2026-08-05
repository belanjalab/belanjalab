import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { sanitizePublicUrl, SITE_URL, toAbsoluteSiteUrl } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase";

export const revalidate = 3600;

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
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
    .select(
      "title,slug,excerpt,content,cover_image,created_at,updated_at",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil artikel: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const article = data as PublicArticle;

  return {
    ...article,
    cover_image: sanitizePublicUrl(article.cover_image, {
      allowHash: false,
    }),
  };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Artikel tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description =
    article.excerpt ?? "Artikel dan panduan belanja dari BelanjaLab.";
  const canonicalPath = `/articles/${article.slug}`;
  const coverImage = article.cover_image
    ? toAbsoluteSiteUrl(article.cover_image)
    : null;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: canonicalPath,
      siteName: "BelanjaLab",
      locale: "id_ID",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      images: coverImage
        ? [{ url: coverImage, alt: article.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const content = article.content?.trim() ?? "";
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const coverImage = article.cover_image
    ? toAbsoluteSiteUrl(article.cover_image)
    : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description:
      article.excerpt ?? "Artikel dan panduan belanja dari BelanjaLab.",
    url: articleUrl,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    inLanguage: "id-ID",
    author: {
      "@type": "Organization",
      name: "BelanjaLab",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "BelanjaLab",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
    ...(coverImage ? { image: [coverImage] } : {}),
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
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

      <article>
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 md:pt-16">
          <nav className="text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-orange-500">
              Homepage
            </Link>
            <span className="px-2">/</span>
            <span>Artikel</span>
          </nav>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
              Panduan Belanja
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="mt-5 text-base leading-7 text-slate-500 sm:text-lg">
                {article.excerpt}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
              <span>{formatDate(article.created_at)}</span>
              <span>•</span>
              <span>{estimateReadingTime(content)} menit baca</span>
            </div>
          </div>

          {article.cover_image && (
            <div className="mt-8 overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={article.cover_image}
                alt={article.title}
                className="max-h-[520px] w-full object-cover"
              />
            </div>
          )}

          <div className="mt-10">
            {paragraphs.length > 0 ? (
              <div className="space-y-6 text-base leading-8 text-slate-700 sm:text-lg">
                {paragraphs.map((paragraph, index) => (
                  <p key={`${article.slug}-${index}`} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Isi artikel belum tersedia.
              </div>
            )}
          </div>

          <div className="mt-12 border-t border-slate-200 pt-6">
            <Link
              href="/"
              className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              ← Kembali ke Homepage
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
