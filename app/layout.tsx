import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://belanjalab.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BelanjaLab",
    template: "%s | BelanjaLab",
  },
  description:
    "Platform rekomendasi, ulasan, dan perbandingan produk untuk membantu kamu belanja lebih cerdas.",
  applicationName: "BelanjaLab",
  keywords: [
    "BelanjaLab",
    "rekomendasi produk",
    "perbandingan produk",
    "review produk",
    "harga produk",
    "belanja cerdas",
  ],
  authors: [{ name: "BelanjaLab" }],
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
    description:
      "Platform rekomendasi, ulasan, dan perbandingan produk untuk membantu kamu belanja lebih cerdas.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BelanjaLab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BelanjaLab",
    description:
      "Platform rekomendasi, ulasan, dan perbandingan produk untuk membantu kamu belanja lebih cerdas.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
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
