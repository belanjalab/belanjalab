import type { Metadata } from "next";
import { getCompareProducts } from "@/lib/products";
import CompareClient from "./compare-client";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bandingkan Produk",
  description:
    "Bandingkan spesifikasi, skor, dan harga produk untuk menemukan pilihan yang paling sesuai.",
  alternates: { canonical: "/compare" },
  robots: { index: false, follow: true },
};

type ComparePageProps = {
  searchParams: Promise<{
    products?: string | string[];
  }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const products = await getCompareProducts();
  const params = await searchParams;
  const productParams = Array.isArray(params.products)
    ? params.products
    : [params.products];
  const initialProductSlugs = Array.from(
    new Set(
      productParams
        .flatMap((value) => value?.split(",") ?? [])
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);

  return (
    <CompareClient
      products={products}
      initialProductSlugs={initialProductSlugs}
    />
  );
}
