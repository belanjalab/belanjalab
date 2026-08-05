import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { SITE_URL } from "@/lib/site-config";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const siteDescription =
  "Platform rekomendasi, ulasan, dan perbandingan produk untuk membantu kamu belanja lebih cerdas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BelanjaLab",
    template: "%s | BelanjaLab",
  },
  description: siteDescription,
  applicationName: "BelanjaLab",
  keywords: [
    "BelanjaLab",
    "rekomendasi produk",
    "perbandingan produk",
    "ulasan produk",
    "harga produk",
    "belanja cerdas",
  ],
  authors: [{ name: "BelanjaLab", url: SITE_URL }],
  creator: "BelanjaLab",
  publisher: "BelanjaLab",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "BelanjaLab",
    title: "BelanjaLab",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "BelanjaLab",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={plusJakartaSans.variable}>{children}</body>
    </html>
  );
}
