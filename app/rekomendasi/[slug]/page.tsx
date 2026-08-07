import type { Metadata } from "next";
import { notFound } from "next/navigation";

import RecommendationLandingView from "@/components/recommendation/recommendation-landing-view";
import {
  getRecommendationBySlug,
  getRecommendationLandingData,
} from "@/lib/recommendations";

export const revalidate = 3600;

const CURRENT_YEAR = new Date().getFullYear();

type RecommendationPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePage(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(firstValue ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: RecommendationPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const recommendation = getRecommendationBySlug(slug);

  if (!recommendation) {
    return {
      title: "Rekomendasi tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const page = parsePage(query.page);
  const canonicalPath = `/rekomendasi/${recommendation.slug}`;
  const pageTitle = `${recommendation.title} ${CURRENT_YEAR}`;

  return {
    title: page > 1 ? `${pageTitle} - Halaman ${page}` : pageTitle,
    description: recommendation.description,
    keywords: [...recommendation.keywords, "BelanjaLab"],
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: page === 1,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: "BelanjaLab",
      url: canonicalPath,
      title: pageTitle,
      description: recommendation.description,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: recommendation.description,
    },
  };
}

export default async function RecommendationPage({
  params,
  searchParams,
}: RecommendationPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const requestedPage = parsePage(query.page);
  const data = await getRecommendationLandingData(slug, requestedPage, 24);

  if (!data) {
    return notFound();
  }

  if (
    data.categoryData.total > 0 &&
    requestedPage > data.categoryData.totalPages
  ) {
    return notFound();
  }

  return <RecommendationLandingView data={data} />;
}
