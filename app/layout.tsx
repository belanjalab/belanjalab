import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://belanjalab.com";

const siteDescription =
  "Platform rekomendasi, ulasan, dan perbandingan produk untuk membantu kamu belanja lebih cerdas.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  authors: [{ name: "BelanjaLab", url: siteUrl }],
  creator: "BelanjaLab",
  publisher: "BelanjaLab",
  alternates: {
    canonical: "/",
  },
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
      <body>{children}</body>
    </html>
  );
}
