import type {
  AffiliateProductFetchErrorCode,
  AffiliateProductPreview,
} from "@/lib/affiliate-import/types";

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 160_000;
const MAX_REDIRECT_HOPS = 4;

const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
} as const;

const BLOCKED_IMAGE_MARKERS = [
  "/assets/",
  "app_icon",
  "app-icon",
  "apple-touch-icon",
  "favicon",
  "ios_icon",
  "ios-icon",
  "mobilemall-live",
  "shopee-mobilemall",
  "shopee_logo",
  "shopee-logo",
];

const PRODUCT_QUERY_KEYS = [
  "origin_link",
  "originLink",
  "redirect",
  "redirect_url",
  "redirectUrl",
  "target",
  "target_url",
  "url",
];

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/\.$/, "");
}

export function isAllowedShopeeHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);

  return (
    normalized === "shopee.co.id" ||
    normalized.endsWith(".shopee.co.id") ||
    normalized === "shope.ee" ||
    normalized.endsWith(".shope.ee") ||
    normalized === "shp.ee" ||
    normalized.endsWith(".shp.ee")
  );
}

function normalizeShopeeUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("unsupported-url");
  }

  if (!isAllowedShopeeHostname(url.hostname)) {
    throw new Error("unsupported-url");
  }

  url.protocol = "https:";
  url.hash = "";
  return url.toString();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x2f;/gi, "/")
    .replace(/\\u002[fF]/g, "/")
    .replace(/\\u003[aA]/g, ":")
    .replace(/\\u0026/g, "&")
    .replace(/\\u003[dD]/g, "=")
    .replace(/\\\//g, "/")
    .trim();
}

function decodeRepeated(value: string) {
  let decoded = decodeHtml(value);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);

      if (next === decoded) {
        break;
      }

      decoded = next;
    } catch {
      break;
    }
  }

  return decodeHtml(decoded).replace(/^["']|["']$/g, "").trim();
}

function readAttribute(tag: string, attributeName: string) {
  const pattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  return decodeHtml(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function hasProductPath(url: URL) {
  const pathname = decodeRepeated(url.pathname);

  return (
    /-i\.\d+\.\d+(?:\b|\/|$)/i.test(pathname) ||
    /\/product\/\d+\/\d+(?:\b|\/|$)/i.test(pathname)
  );
}

function productUrlFromDeepLink(value: string) {
  const decoded = decodeRepeated(value);
  const match = decoded.match(
    /shopee:\/\/(?:product|item)\/(\d+)\/(\d+)/i,
  );

  if (!match) {
    return "";
  }

  return `https://shopee.co.id/product/${match[1]}/${match[2]}`;
}

function extractProductUrlFromValue(
  value: string,
  baseUrl?: string,
): string {
  if (!value) {
    return "";
  }

  const deepLink = productUrlFromDeepLink(value);

  if (deepLink) {
    return deepLink;
  }

  const decoded = decodeRepeated(value).replace(/[),.;]+$/, "");
  let parsed: URL;

  try {
    parsed = new URL(decoded, baseUrl);
  } catch {
    return "";
  }

  if (!isAllowedShopeeHostname(parsed.hostname)) {
    return "";
  }

  for (const key of PRODUCT_QUERY_KEYS) {
    const nestedValue = parsed.searchParams.get(key);

    if (!nestedValue || nestedValue === value) {
      continue;
    }

    const nestedProductUrl = extractProductUrlFromValue(
      nestedValue,
      parsed.toString(),
    );

    if (nestedProductUrl) {
      return nestedProductUrl;
    }
  }

  if (!hasProductPath(parsed)) {
    return "";
  }

  parsed.protocol = "https:";
  parsed.hash = "";
  return parsed.toString();
}

function extractProductUrlFromHtml(html: string, baseUrl: string) {
  const decodedHtml = decodeHtml(html);
  const candidates: string[] = [];

  for (const match of decodedHtml.matchAll(
    /(?:origin_link|originLink|redirect_url|redirectUrl|target_url|targetUrl)["']?\s*[:=]\s*["']([^"'<>\s]+)/gi,
  )) {
    if (match[1]) {
      candidates.push(match[1]);
    }
  }

  for (const match of decodedHtml.matchAll(
    /https?(?::|%3A)(?:\/\/|%2F%2F)(?:[a-z0-9-]+\.)?shopee\.co\.id[^\s"'<>\\]+/gi,
  )) {
    if (match[0]) {
      candidates.push(match[0]);
    }
  }

  for (const match of decodedHtml.matchAll(
    /shopee:\/\/(?:product|item)\/\d+\/\d+/gi,
  )) {
    if (match[0]) {
      candidates.push(match[0]);
    }
  }

  const canonicalPattern = /<(?:link|meta)\b[^>]*>/gi;
  let canonicalMatch: RegExpExecArray | null;

  while ((canonicalMatch = canonicalPattern.exec(decodedHtml)) !== null) {
    const tag = canonicalMatch[0];
    const rel = readAttribute(tag, "rel").toLowerCase();
    const property = (
      readAttribute(tag, "property") || readAttribute(tag, "name")
    ).toLowerCase();

    if (rel.includes("canonical")) {
      candidates.push(readAttribute(tag, "href"));
    }

    if (property === "og:url" || property === "twitter:url") {
      candidates.push(readAttribute(tag, "content"));
    }
  }

  for (const candidate of candidates) {
    const productUrl = extractProductUrlFromValue(candidate, baseUrl);

    if (productUrl) {
      return productUrl;
    }
  }

  return "";
}

function isBlockedImageUrl(value: string) {
  const normalized = value.toLowerCase();

  return BLOCKED_IMAGE_MARKERS.some((marker) => normalized.includes(marker));
}

function normalizeProductImageUrl(value: string, baseUrl: string) {
  if (!value) {
    return "";
  }

  try {
    const decoded = decodeRepeated(value);
    const url = new URL(
      decoded.startsWith("//") ? `https:${decoded}` : decoded,
      baseUrl,
    );
    const hostname = normalizeHostname(url.hostname);
    const pathname = url.pathname.toLowerCase();

    if (isBlockedImageUrl(url.toString())) {
      return "";
    }

    const isShopeeProductImage =
      (hostname.endsWith("susercontent.com") && pathname.includes("/file/")) ||
      (hostname.endsWith("shopee.co.id") && pathname.includes("/file/")) ||
      (hostname.includes("img.shopee") && pathname.includes("/file/"));

    if (!isShopeeProductImage) {
      return "";
    }

    url.protocol = "https:";
    return url.toString();
  } catch {
    return "";
  }
}

function extractMetaImage(html: string, baseUrl: string) {
  const metaPattern = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = metaPattern.exec(html)) !== null) {
    const tag = match[0];
    const key = (readAttribute(tag, "property") || readAttribute(tag, "name"))
      .toLowerCase()
      .trim();

    if (
      key !== "og:image" &&
      key !== "og:image:secure_url" &&
      key !== "twitter:image" &&
      key !== "twitter:image:src"
    ) {
      continue;
    }

    const imageUrl = normalizeProductImageUrl(
      readAttribute(tag, "content"),
      baseUrl,
    );

    if (imageUrl) {
      return imageUrl;
    }
  }

  return "";
}

function extractFallbackImage(html: string, baseUrl: string) {
  const normalized = decodeHtml(html);
  const pattern = /https?:\/\/[^"'\s<>\\]+/gi;
  const candidates: Array<{ url: string; score: number }> = [];
  let match: RegExpExecArray | null;
  let checked = 0;

  while ((match = pattern.exec(normalized)) !== null && checked < 180) {
    checked += 1;
    const imageUrl = normalizeProductImageUrl(match[0], baseUrl);

    if (!imageUrl) {
      continue;
    }

    const lower = imageUrl.toLowerCase();
    let score = 1;

    if (lower.includes("down-id.img.susercontent.com/file/")) score += 20;
    if (/\/file\/id-/i.test(lower)) score += 10;
    if (lower.includes("_tn")) score -= 2;

    candidates.push({ url: imageUrl, score });
  }

  candidates.sort((left, right) => right.score - left.score);
  return candidates[0]?.url ?? "";
}

async function readLimitedHtml(response: Response) {
  if (!response.body) {
    return (await response.text()).slice(0, MAX_HTML_BYTES);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let totalBytes = 0;

  try {
    while (totalBytes < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();

      if (done || !value) {
        break;
      }

      const remaining = MAX_HTML_BYTES - totalBytes;
      const chunk =
        value.byteLength > remaining ? value.subarray(0, remaining) : value;

      html += decoder.decode(chunk, { stream: true });
      totalBytes += chunk.byteLength;

      if (/<\/head>/i.test(html) || chunk.byteLength < value.byteLength) {
        break;
      }
    }
  } finally {
    html += decoder.decode();

    try {
      await reader.cancel();
    } catch {
      // Stream sudah selesai.
    }
  }

  return html;
}

function createPreview(
  affiliateUrl: string,
  options: {
    resolvedUrl?: string | null;
    imageUrl?: string;
    errorCode?: AffiliateProductFetchErrorCode | null;
    message: string;
  },
): AffiliateProductPreview {
  const imageUrl = options.imageUrl ?? "";

  return {
    id: crypto.randomUUID(),
    marketplace: "shopee",
    affiliateUrl,
    resolvedUrl: options.resolvedUrl ?? null,
    status: imageUrl ? "success" : "failed",
    errorCode: imageUrl ? null : (options.errorCode ?? "metadata-not-found"),
    message: options.message,
    warnings: [],
    name: "",
    description: "",
    imageUrl,
    price: null,
    priceMax: null,
    currency: null,
    shopId: null,
    itemId: null,
    fetchedAt: new Date().toISOString(),
  };
}

async function resolveProductUrl(inputUrl: string, signal: AbortSignal) {
  const directProductUrl = extractProductUrlFromValue(inputUrl);

  if (directProductUrl) {
    return directProductUrl;
  }

  let currentUrl = inputUrl;

  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
    const response = await fetch(currentUrl, {
      method: "GET",
      headers: REQUEST_HEADERS,
      redirect: "manual",
      signal,
    });

    const responseProductUrl = extractProductUrlFromValue(response.url);

    if (responseProductUrl) {
      return responseProductUrl;
    }

    const location = response.headers.get("location");

    if (location) {
      const nextUrl = new URL(location, currentUrl).toString();
      const productUrl = extractProductUrlFromValue(nextUrl, currentUrl);

      if (productUrl) {
        return productUrl;
      }

      let parsedNextUrl: URL;

      try {
        parsedNextUrl = new URL(nextUrl);
      } catch {
        return "";
      }

      if (!isAllowedShopeeHostname(parsedNextUrl.hostname)) {
        return "";
      }

      currentUrl = parsedNextUrl.toString();
      continue;
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (response.ok && (!contentType || contentType.includes("text/html"))) {
      const html = await readLimitedHtml(response);
      const productUrl = extractProductUrlFromHtml(
        html,
        response.url || currentUrl,
      );

      if (productUrl) {
        return productUrl;
      }
    }

    break;
  }

  return "";
}

async function scanImageLink(affiliateUrl: string) {
  let normalizedUrl: string;

  try {
    normalizedUrl = normalizeShopeeUrl(affiliateUrl);
  } catch {
    return createPreview(affiliateUrl, {
      errorCode: "unsupported-url",
      message: "Link Shopee tidak valid atau domain tidak didukung.",
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const productUrl = await resolveProductUrl(normalizedUrl, controller.signal);

    if (!productUrl) {
      return createPreview(affiliateUrl, {
        resolvedUrl: normalizedUrl,
        errorCode: "redirect-failed",
        message:
          "URL produk asli tidak ditemukan dari link pendek Shopee. Ikon aplikasi tidak diekspor.",
      });
    }

    const response = await fetch(productUrl, {
      method: "GET",
      headers: REQUEST_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      return createPreview(affiliateUrl, {
        resolvedUrl: productUrl,
        errorCode: "http-error",
        message: `Halaman produk Shopee mengembalikan HTTP ${response.status}.`,
      });
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType && !contentType.includes("text/html")) {
      return createPreview(affiliateUrl, {
        resolvedUrl: productUrl,
        errorCode: "unsupported-content",
        message: "Respons halaman produk Shopee bukan HTML.",
      });
    }

    const resolvedUrl =
      extractProductUrlFromValue(response.url) || productUrl;
    const html = await readLimitedHtml(response);
    const imageUrl =
      extractMetaImage(html, resolvedUrl) ||
      extractFallbackImage(html, resolvedUrl);

    return createPreview(affiliateUrl, {
      resolvedUrl,
      imageUrl,
      errorCode: imageUrl ? null : "metadata-not-found",
      message: imageUrl
        ? "Link gambar produk berhasil diambil."
        : "Gambar produk tidak ditemukan. Ikon dan logo Shopee otomatis diabaikan.",
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";

    return createPreview(affiliateUrl, {
      errorCode: timedOut ? "request-timeout" : "fetch-failed",
      message: timedOut
        ? "Permintaan ke Shopee melewati batas waktu."
        : "Halaman Shopee gagal dibaca.",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function scanAffiliateProducts(links: string[]) {
  const items: AffiliateProductPreview[] = [];

  for (const link of links) {
    items.push(await scanImageLink(link));
  }

  return items;
}
