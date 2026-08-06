import {
  deriveProductNameFromUrl,
  extractEmbeddedShopeeProductUrl,
  extractShopeeProductIds,
  parseAffiliateProductMetadata,
} from "@/lib/affiliate-import/metadata";
import { fetchJinaReaderMetadata } from "@/lib/affiliate-import/jina-reader";
import { fetchMicrolinkMetadata } from "@/lib/affiliate-import/microlink";
import { fetchShopeeProductApiMetadata } from "@/lib/affiliate-import/shopee-product-api";
import type {
  AffiliateProductFetchErrorCode,
  AffiliateProductPreview,
} from "@/lib/affiliate-import/types";

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_REDIRECTS = 6;
const MAX_HTML_BYTES = 2_500_000;
const SCAN_CONCURRENCY = 2;

const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);

const REQUEST_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Referer: "https://shopee.co.id/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
} as const;

const SOCIAL_PREVIEW_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Referer: "https://shopee.co.id/",
  "User-Agent":
    "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)",
} as const;

class AffiliateFetchError extends Error {
  readonly code: AffiliateProductFetchErrorCode;

  constructor(code: AffiliateProductFetchErrorCode, message: string) {
    super(message);
    this.name = "AffiliateFetchError";
    this.code = code;
  }
}

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/\.$/, "");
}

export function isAllowedShopeeHostname(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);

  return (
    normalizedHostname === "shopee.co.id" ||
    normalizedHostname.endsWith(".shopee.co.id") ||
    normalizedHostname === "shope.ee" ||
    normalizedHostname.endsWith(".shope.ee") ||
    normalizedHostname === "shp.ee" ||
    normalizedHostname.endsWith(".shp.ee")
  );
}

function normalizeShopeeUrl(value: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new AffiliateFetchError(
      "unsupported-url",
      "Format link Shopee tidak valid.",
    );
  }

  if (!isAllowedShopeeHostname(parsedUrl.hostname)) {
    throw new AffiliateFetchError(
      "unsupported-url",
      "Link harus menggunakan domain resmi Shopee Indonesia.",
    );
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new AffiliateFetchError(
      "unsupported-url",
      "Link dengan kredensial tidak diizinkan.",
    );
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new AffiliateFetchError(
      "unsupported-url",
      "Protokol link tidak didukung.",
    );
  }

  parsedUrl.protocol = "https:";
  parsedUrl.hash = "";

  return parsedUrl;
}

function normalizeRedirectUrl(location: string, currentUrl: URL) {
  let nextUrl: URL;

  try {
    nextUrl = new URL(location, currentUrl);
  } catch {
    throw new AffiliateFetchError(
      "redirect-failed",
      "Shopee mengembalikan alamat redirect yang tidak valid.",
    );
  }

  if (!isAllowedShopeeHostname(nextUrl.hostname)) {
    throw new AffiliateFetchError(
      "redirect-domain-blocked",
      "Redirect keluar dari domain resmi Shopee diblokir untuk keamanan.",
    );
  }

  if (nextUrl.protocol !== "https:" && nextUrl.protocol !== "http:") {
    throw new AffiliateFetchError(
      "redirect-domain-blocked",
      "Protokol redirect tidak didukung.",
    );
  }

  nextUrl.protocol = "https:";
  nextUrl.hash = "";

  return nextUrl;
}

async function fetchWithSafeRedirects(
  inputUrl: string,
  signal: AbortSignal,
  headers: Record<string, string> = REQUEST_HEADERS,
) {
  let currentUrl = normalizeShopeeUrl(inputUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      method: "GET",
      headers,
      redirect: "manual",
      cache: "no-store",
      signal,
    });

    if (!REDIRECT_STATUS_CODES.has(response.status)) {
      const responseUrl = response.url
        ? normalizeRedirectUrl(response.url, currentUrl)
        : currentUrl;

      return {
        response,
        finalUrl: responseUrl,
      };
    }

    const location = response.headers.get("location");
    await response.body?.cancel();

    if (!location) {
      throw new AffiliateFetchError(
        "redirect-failed",
        "Shopee tidak memberikan tujuan redirect.",
      );
    }

    if (redirectCount === MAX_REDIRECTS) {
      throw new AffiliateFetchError(
        "redirect-failed",
        "Jumlah redirect Shopee melebihi batas aman.",
      );
    }

    currentUrl = normalizeRedirectUrl(location, currentUrl);
  }

  throw new AffiliateFetchError(
    "redirect-failed",
    "Redirect Shopee tidak dapat diselesaikan.",
  );
}

async function readResponseText(response: Response) {
  if (!response.body) {
    const text = await response.text();
    return text.slice(0, MAX_HTML_BYTES);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let html = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        html += decoder.decode();
        break;
      }

      if (!value) {
        continue;
      }

      const remainingBytes = MAX_HTML_BYTES - totalBytes;

      if (remainingBytes <= 0) {
        await reader.cancel();
        break;
      }

      const chunk =
        value.byteLength > remainingBytes
          ? value.subarray(0, remainingBytes)
          : value;

      totalBytes += chunk.byteLength;
      html += decoder.decode(chunk, { stream: true });

      if (totalBytes >= MAX_HTML_BYTES) {
        await reader.cancel();
        html += decoder.decode();
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return html;
}

function ensureHtmlResponse(response: Response) {
  if (!response.ok) {
    throw new AffiliateFetchError(
      "http-error",
      `Shopee mengembalikan HTTP ${response.status}. Coba lagi beberapa saat.`,
    );
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (
    contentType &&
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml+xml")
  ) {
    throw new AffiliateFetchError(
      "unsupported-content",
      "Link tidak mengarah ke halaman HTML produk Shopee.",
    );
  }
}

function findProductUrlInQuery(url: URL) {
  for (const [, rawValue] of url.searchParams) {
    let candidate = rawValue;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const embeddedUrl = extractEmbeddedShopeeProductUrl(
        candidate,
        url.toString(),
      );

      if (embeddedUrl) {
        return embeddedUrl;
      }

      try {
        const decoded = decodeURIComponent(candidate);

        if (decoded === candidate) {
          break;
        }

        candidate = decoded;
      } catch {
        break;
      }
    }
  }

  return "";
}

function getProductDestination(
  html: string,
  finalUrl: URL,
  canonicalUrl: string | null,
) {
  const candidates = [
    canonicalUrl ?? "",
    findProductUrlInQuery(finalUrl),
    extractEmbeddedShopeeProductUrl(html, finalUrl.toString()),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      const candidateUrl = normalizeShopeeUrl(candidate);
      const ids = extractShopeeProductIds(candidateUrl.toString());

      if (ids.shopId && ids.itemId) {
        return candidateUrl.toString();
      }
    } catch {
      // Kandidat lain masih dapat diperiksa.
    }
  }

  return "";
}

function hasCompleteMetadata(metadata: {
  name: string;
  imageUrl: string;
  price: number | null;
}) {
  return Boolean(metadata.name && metadata.imageUrl && metadata.price !== null);
}

function getMetadataScore(metadata: {
  name: string;
  imageUrl: string;
  price: number | null;
  description?: string;
  canonicalUrl?: string | null;
}) {
  return (
    (metadata.name ? 3 : 0) +
    (metadata.imageUrl ? 4 : 0) +
    (metadata.price !== null ? 3 : 0) +
    (metadata.description ? 1 : 0) +
    (metadata.canonicalUrl ? 1 : 0)
  );
}

function getMissingFieldLabels(metadata: {
  name: string;
  imageUrl: string;
  price: number | null;
}) {
  const missingFields: string[] = [];

  if (!metadata.name) {
    missingFields.push("nama");
  }

  if (!metadata.imageUrl) {
    missingFields.push("gambar");
  }

  if (metadata.price === null) {
    missingFields.push("harga");
  }

  return missingFields;
}

function createFailurePreview(
  affiliateUrl: string,
  error: AffiliateFetchError,
): AffiliateProductPreview {
  return {
    id: affiliateUrl,
    marketplace: "shopee",
    affiliateUrl,
    resolvedUrl: null,
    status: "failed",
    errorCode: error.code,
    message: error.message,
    warnings: [
      "Shopee dapat membatasi akses otomatis. Data tetap bisa dilengkapi manual pada tahap preview.",
    ],
    name: deriveProductNameFromUrl(affiliateUrl),
    description: "",
    imageUrl: "",
    price: null,
    priceMax: null,
    currency: null,
    shopId: null,
    itemId: null,
    fetchedAt: new Date().toISOString(),
  };
}

type ProductPageFetchResult = {
  html: string;
  finalUrl: URL;
  warning: string | null;
};

function combineWarnings(...warnings: Array<string | null | undefined>) {
  const uniqueWarnings = warnings.filter(
    (warning, index, values): warning is string =>
      Boolean(warning) && values.indexOf(warning) === index,
  );

  return uniqueWarnings.length > 0 ? uniqueWarnings.join(" ") : null;
}

async function readHtmlSafely(response: Response) {
  try {
    ensureHtmlResponse(response);

    return {
      html: await readResponseText(response),
      warning: null,
    };
  } catch (error) {
    await response.body?.cancel().catch(() => undefined);

    if (error instanceof AffiliateFetchError) {
      return {
        html: "",
        warning: error.message,
      };
    }

    throw error;
  }
}

async function fetchProductPage(
  inputUrl: string,
  signal: AbortSignal,
): Promise<ProductPageFetchResult> {
  const firstFetch = await fetchWithSafeRedirects(inputUrl, signal);
  const firstPage = await readHtmlSafely(firstFetch.response);
  const firstMetadata = parseAffiliateProductMetadata(
    firstPage.html,
    firstFetch.finalUrl.toString(),
  );
  const firstIds = extractShopeeProductIds(firstFetch.finalUrl.toString());
  const discoveredProductDestination = getProductDestination(
    firstPage.html,
    firstFetch.finalUrl,
    firstMetadata.canonicalUrl,
  );
  const canonicalProductDestination =
    firstIds.shopId && firstIds.itemId
      ? `https://shopee.co.id/product/${firstIds.shopId}/${firstIds.itemId}`
      : "";
  const productDestination =
    discoveredProductDestination || canonicalProductDestination;

  if (
    productDestination &&
    productDestination !== firstFetch.finalUrl.toString() &&
    (!firstIds.shopId || !firstIds.itemId || !hasCompleteMetadata(firstMetadata))
  ) {
    try {
      const secondFetch = await fetchWithSafeRedirects(productDestination, signal);
      const secondPage = await readHtmlSafely(secondFetch.response);

      return {
        html: secondPage.html || firstPage.html,
        finalUrl: secondFetch.finalUrl,
        warning: combineWarnings(firstPage.warning, secondPage.warning),
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }

      const secondWarning =
        error instanceof Error
          ? `Halaman produk kedua tidak dapat dibaca: ${error.message}`
          : "Halaman produk kedua tidak dapat dibaca.";

      return {
        html: firstPage.html,
        finalUrl: normalizeShopeeUrl(productDestination),
        warning: combineWarnings(firstPage.warning, secondWarning),
      };
    }
  }

  return {
    html: firstPage.html,
    finalUrl: productDestination
      ? normalizeShopeeUrl(productDestination)
      : firstFetch.finalUrl,
    warning: firstPage.warning,
  };
}

export async function scanAffiliateProduct(
  affiliateUrl: string,
): Promise<AffiliateProductPreview> {
  const normalizedAffiliateUrl = normalizeShopeeUrl(affiliateUrl).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const pageResult = await fetchProductPage(
      normalizedAffiliateUrl,
      controller.signal,
    );
    const { finalUrl } = pageResult;
    let pageWarning = pageResult.warning;
    let htmlMetadata = parseAffiliateProductMetadata(
      pageResult.html,
      finalUrl.toString(),
    );

    if (!hasCompleteMetadata(htmlMetadata)) {
      try {
        const socialFetch = await fetchWithSafeRedirects(
          finalUrl.toString(),
          controller.signal,
          SOCIAL_PREVIEW_HEADERS,
        );
        const socialPage = await readHtmlSafely(socialFetch.response);
        const socialMetadata = parseAffiliateProductMetadata(
          socialPage.html,
          socialFetch.finalUrl.toString(),
        );

        if (getMetadataScore(socialMetadata) > getMetadataScore(htmlMetadata)) {
          htmlMetadata = socialMetadata;
        }

        pageWarning = combineWarnings(pageWarning, socialPage.warning);
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          pageWarning = combineWarnings(
            pageWarning,
            error instanceof Error
              ? `Preview sosial Shopee tidak dapat dibaca: ${error.message}`
              : "Preview sosial Shopee tidak dapat dibaca.",
          );
        }
      }
    }
    const idsFromResolvedUrl = extractShopeeProductIds(finalUrl.toString());
    const idsFromCanonicalUrl = htmlMetadata.canonicalUrl
      ? extractShopeeProductIds(htmlMetadata.canonicalUrl)
      : { shopId: null, itemId: null };
    const idsFromAffiliateUrl = extractShopeeProductIds(normalizedAffiliateUrl);
    const ids = {
      shopId:
        idsFromResolvedUrl.shopId ??
        idsFromCanonicalUrl.shopId ??
        idsFromAffiliateUrl.shopId,
      itemId:
        idsFromResolvedUrl.itemId ??
        idsFromCanonicalUrl.itemId ??
        idsFromAffiliateUrl.itemId,
    };
    const productUrl =
      htmlMetadata.canonicalUrl ||
      (ids.shopId && ids.itemId
        ? `https://shopee.co.id/product/${ids.shopId}/${ids.itemId}`
        : finalUrl.toString());
    const nameFromUrl = deriveProductNameFromUrl(productUrl);
    const metadataBeforeInternalApi = {
      name: htmlMetadata.name || nameFromUrl,
      imageUrl: htmlMetadata.imageUrl,
      price: htmlMetadata.price,
    };
    const apiMetadata =
      !hasCompleteMetadata(metadataBeforeInternalApi) && ids.shopId && ids.itemId
        ? await fetchShopeeProductApiMetadata({
            shopId: ids.shopId,
            itemId: ids.itemId,
            refererUrl: productUrl,
            productName: htmlMetadata.name || nameFromUrl,
            signal: controller.signal,
          })
        : null;
    const metadataBeforeMicrolink = {
      name: apiMetadata?.name || htmlMetadata.name || nameFromUrl,
      imageUrl: apiMetadata?.imageUrl || htmlMetadata.imageUrl,
      price: apiMetadata?.price ?? htmlMetadata.price,
    };
    const microlinkMetadata = !hasCompleteMetadata(metadataBeforeMicrolink)
      ? await fetchMicrolinkMetadata({
          url: apiMetadata?.canonicalUrl || productUrl,
          signal: controller.signal,
        })
      : null;
    const metadataBeforeReader = {
      name:
        apiMetadata?.name ||
        htmlMetadata.name ||
        microlinkMetadata?.name ||
        nameFromUrl,
      imageUrl:
        apiMetadata?.imageUrl ||
        htmlMetadata.imageUrl ||
        microlinkMetadata?.imageUrl ||
        "",
      price:
        apiMetadata?.price ??
        htmlMetadata.price ??
        microlinkMetadata?.price ??
        null,
    };
    const readerResult = !hasCompleteMetadata(metadataBeforeReader)
      ? await fetchJinaReaderMetadata({
          url:
            apiMetadata?.canonicalUrl ||
            htmlMetadata.canonicalUrl ||
            microlinkMetadata?.canonicalUrl ||
            productUrl,
          productName: metadataBeforeReader.name,
          shopId: ids.shopId,
          itemId: ids.itemId,
          signal: controller.signal,
        })
      : {
          metadata: null,
          warning: null,
        };
    const readerMetadata = readerResult.metadata;
    const metadata = {
      name:
        apiMetadata?.name ||
        htmlMetadata.name ||
        microlinkMetadata?.name ||
        readerMetadata?.name ||
        nameFromUrl,
      description:
        apiMetadata?.description ||
        htmlMetadata.description ||
        microlinkMetadata?.description ||
        readerMetadata?.description ||
        "",
      imageUrl:
        apiMetadata?.imageUrl ||
        htmlMetadata.imageUrl ||
        microlinkMetadata?.imageUrl ||
        readerMetadata?.imageUrl ||
        "",
      price:
        apiMetadata?.price ??
        htmlMetadata.price ??
        readerMetadata?.price ??
        microlinkMetadata?.price ??
        null,
      priceMax:
        apiMetadata?.priceMax ??
        htmlMetadata.priceMax ??
        readerMetadata?.priceMax ??
        microlinkMetadata?.priceMax ??
        null,
      currency:
        apiMetadata?.currency ||
        htmlMetadata.currency ||
        readerMetadata?.currency ||
        microlinkMetadata?.currency ||
        null,
      canonicalUrl:
        apiMetadata?.canonicalUrl ||
        htmlMetadata.canonicalUrl ||
        microlinkMetadata?.canonicalUrl ||
        readerMetadata?.canonicalUrl ||
        productUrl,
    };
    const fallbackName = deriveProductNameFromUrl(
      metadata.canonicalUrl || finalUrl.toString(),
    );
    const name = metadata.name || fallbackName;
    const priceMax =
      metadata.priceMax !== null &&
      metadata.price !== null &&
      metadata.priceMax > metadata.price
        ? metadata.priceMax
        : null;
    const normalizedMetadata = {
      ...metadata,
      name,
      priceMax,
    };
    const missingFields = getMissingFieldLabels(normalizedMetadata);
    const status = hasCompleteMetadata(normalizedMetadata)
      ? "success"
      : "partial";
    const warnings: string[] = [];

    if (apiMetadata) {
      warnings.push(
        apiMetadata.source === "search-items"
          ? "Metadata dilengkapi dari hasil pencarian produk Shopee."
          : "Metadata dilengkapi dari endpoint publik produk Shopee.",
      );
    }

    if (microlinkMetadata) {
      warnings.push(
        "Metadata yang belum tersedia dilengkapi melalui fallback link preview.",
      );
    }

    if (readerMetadata) {
      warnings.push(
        readerMetadata.source === "jina-shopee-search"
          ? "Harga dilengkapi dari halaman pencarian Shopee yang dirender otomatis."
          : "Metadata dilengkapi melalui browser reader tanpa Shopee Affiliate API.",
      );
    }

    if (readerResult.warning && missingFields.length > 0) {
      warnings.push(readerResult.warning);
    }

    if (pageWarning && missingFields.length > 0) {
      warnings.push(`Halaman publik Shopee tidak dapat dibaca penuh: ${pageWarning}`);
    }

    if (priceMax !== null) {
      warnings.push(
        "Produk memiliki rentang harga variasi; harga terendah dan tertinggi ditampilkan.",
      );
    }

    if (missingFields.length > 0) {
      warnings.push(
        `${missingFields.join(", ")} belum berhasil dibaca otomatis setelah semua jalur dicoba. Klik Coba Ulang atau lengkapi manual.`,
      );
    }

    const uniqueWarnings = warnings.filter(
      (warning, index, values) => values.indexOf(warning) === index,
    );

    return {
      id: normalizedAffiliateUrl,
      marketplace: "shopee",
      affiliateUrl: normalizedAffiliateUrl,
      resolvedUrl: normalizedMetadata.canonicalUrl || finalUrl.toString(),
      status,
      errorCode: missingFields.length > 0 ? "metadata-not-found" : null,
      message:
        status === "success"
          ? "Nama, gambar, dan harga berhasil diambil tanpa Affiliate API."
          : `Data berhasil diambil sebagian. Lengkapi ${missingFields.join(", ")}.`,
      warnings: uniqueWarnings,
      name: normalizedMetadata.name,
      description: normalizedMetadata.description,
      imageUrl: normalizedMetadata.imageUrl,
      price: normalizedMetadata.price,
      priceMax: normalizedMetadata.priceMax,
      currency: normalizedMetadata.currency,
      shopId: ids.shopId,
      itemId: ids.itemId,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof AffiliateFetchError) {
      return createFailurePreview(normalizedAffiliateUrl, error);
    }

    if (error instanceof Error && error.name === "AbortError") {
      return createFailurePreview(
        normalizedAffiliateUrl,
        new AffiliateFetchError(
          "request-timeout",
          "Pengambilan data melewati batas waktu. Coba ulang link ini.",
        ),
      );
    }

    return createFailurePreview(
      normalizedAffiliateUrl,
      new AffiliateFetchError(
        "fetch-failed",
        error instanceof Error
          ? `Gagal mengambil data: ${error.message}`
          : "Gagal mengambil data produk dari Shopee.",
      ),
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function scanAffiliateProducts(links: string[]) {
  const results = new Array<AffiliateProductPreview>(links.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= links.length) {
        return;
      }

      results[currentIndex] = await scanAffiliateProduct(
        links[currentIndex] as string,
      );
    }
  }

  const workerCount = Math.min(SCAN_CONCURRENCY, links.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}
