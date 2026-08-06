import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import {
  getOrganizationStructuredData,
  getWebsiteStructuredData,
  serializeStructuredData,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Bandingkan Produk dan Harga`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "BelanjaLab",
    "rekomendasi produk",
    "perbandingan produk",
    "ulasan produk",
    "harga produk",
    "belanja cerdas",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Bandingkan Produk dan Harga`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Shopping Decision Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Bandingkan Produk dan Harga`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
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
  verification: googleVerification
    ? {
        google: googleVerification,
      }
    : undefined,
  category: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [
    getOrganizationStructuredData(),
    getWebsiteStructuredData(),
  ];

  return (
    <html lang="id">
      <body className={inter.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
