import { SITE_URL } from "@/lib/site-config";

export const SITE_NAME = "BelanjaLab";
export const SITE_DESCRIPTION =
  "Platform rekomendasi, ulasan, dan perbandingan produk untuk membantu kamu belanja lebih cerdas.";

export function getOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.png`,
    },
  };
}

export function getWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "id-ID",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
