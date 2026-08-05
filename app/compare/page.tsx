import type { Metadata } from "next";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import PageIntro from "@/components/site/page-intro";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getActiveSiteFooter } from "@/lib/footer";
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
  const [products, footer] = await Promise.all([
    getCompareProducts(),
    getActiveSiteFooter(),
  ]);
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
    <>
      <SiteHeader active="compare" />
      <main id="konten-utama" className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
        <PageIntro
          eyebrow="Bandingkan sebelum membeli"
          title="Lihat perbedaan yang benar-benar penting."
          description="Pilih hingga tiga produk untuk membandingkan harga, BelanjaLab Score, dan spesifikasi dalam satu tampilan."
          compact
        />
        <CompareClient
          products={products}
          initialProductSlugs={initialProductSlugs}
        />
      </main>
      <SiteFooter footer={footer} />
      <MobileBottomNav active="compare" />
    </>
  );
}
