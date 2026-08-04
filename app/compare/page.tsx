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

export default async function ComparePage() {
  const products = await getCompareProducts();

  return <CompareClient products={products} />;
}
