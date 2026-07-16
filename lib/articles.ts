import { getSupabaseClient } from "./supabase";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published: boolean;
  created_at: string;
};

export type HomepageArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: string;
  readingTime: string;
};

function estimateReadingTime(content: string | null) {
  const wordCount = (content ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return `${minutes} menit baca`;
}

export async function getHomepageArticles(): Promise<HomepageArticle[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image,
      published,
      created_at
    `)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Gagal mengambil artikel Homepage:", error.message);
    return [];
  }

  return ((data ?? []) as ArticleRow[]).map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    imageUrl: article.cover_image,
    publishedAt: article.created_at,
    readingTime: estimateReadingTime(article.content),
  }));
}
