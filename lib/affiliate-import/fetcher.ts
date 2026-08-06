import type {
  AffiliateProductFetchErrorCode,
  AffiliateProductPreview,
} from "@/lib/affiliate-import/types";

const REQUEST_TIMEOUT_MS = 7_000;
const MAX_HTML_BYTES = 128_000;

const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
} as const;

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
    .replace(/\\u002f/gi, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/\\\//g, "/")
    .trim();
}

function readAttribute(tag: string, attributeName: string) {
  const pattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  return decodeHtml(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function normalizeImageUrl(value: string, baseUrl: string) {
  if (!value) {
    return "";
  }

  try {
    const decoded = decodeHtml(value);
    const url = new URL(
      decoded.startsWith("//") ? `https:${decoded}` : decoded,
      baseUrl,
    );
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    const isImage =
      hostname.endsWith("susercontent.com") ||
      hostname.includes("img.shopee") ||
      /\.(?:avif|gif|jpe?g|png|webp)$/i.test(pathname);

    if (!isImage) {
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

    const imageUrl = normalizeImageUrl(readAttribute(tag, "content"), baseUrl);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return "";
}

function extractFallbackImage(html: string, baseUrl: string) {
  const normalized = decodeHtml(html);
  const pattern = /https?:\/\/[^"'\s<>\\]+/gi;
  let match: RegExpExecArray | null;
  let checked = 0;

  while ((match = pattern.exec(normalized)) !== null && checked < 120) {
    checked += 1;
    const imageUrl = normalizeImageUrl(match[0], baseUrl);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return "";
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
      const chunk = value.byteLength > remaining ? value.subarray(0, remaining) : value;

      html += decoder.decode(chunk, { stream: true });
      totalBytes += chunk.byteLength;

      // Metadata gambar umumnya berada di bagian head. Berhenti secepat mungkin.
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
    const response = await fetch(normalizedUrl, {
      method: "GET",
      headers: REQUEST_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      return createPreview(affiliateUrl, {
        resolvedUrl: response.url || normalizedUrl,
        errorCode: "http-error",
        message: `Shopee mengembalikan HTTP ${response.status}.`,
      });
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType && !contentType.includes("text/html")) {
      return createPreview(affiliateUrl, {
        resolvedUrl: response.url || normalizedUrl,
        errorCode: "unsupported-content",
        message: "Respons Shopee bukan halaman HTML.",
      });
    }

    let resolvedUrl = normalizedUrl;

    try {
      if (response.url) {
        resolvedUrl = normalizeShopeeUrl(response.url);
      }
    } catch {
      // Gunakan URL input apabila redirect berakhir di domain lain.
    }

    const html = await readLimitedHtml(response);
    const imageUrl =
      extractMetaImage(html, resolvedUrl) ||
      extractFallbackImage(html, resolvedUrl);

    return createPreview(affiliateUrl, {
      resolvedUrl,
      imageUrl,
      errorCode: imageUrl ? null : "metadata-not-found",
      message: imageUrl
        ? "Link gambar berhasil diambil."
        : "Link gambar tidak ditemukan dari halaman Shopee.",
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
