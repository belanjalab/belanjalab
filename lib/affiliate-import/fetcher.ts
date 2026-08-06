import type {
  AffiliateProductFetchErrorCode,
  AffiliateProductPreview,
} from "@/lib/affiliate-import/types";

const REQUEST_TIMEOUT_MS = 28_000;
const DIRECT_RESPONSE_LIMIT = 220_000;
const EXTERNAL_RESPONSE_LIMIT = 520_000;

const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Referer: "https://shopee.co.id/",
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

  if (url.username || url.password) {
    throw new Error("unsupported-url");
  }

  url.protocol = "https:";
  url.hash = "";
  return url.toString();
}

function decodeTransportEscapes(value: string) {
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

function readAttribute(tag: string, attributeName: string) {
  const pattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  return decodeTransportEscapes(
    match?.[1] ?? match?.[2] ?? match?.[3] ?? "",
  );
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
    const decoded = decodeTransportEscapes(value)
      .replace(/^['"(<\[]+/, "")
      .replace(/['")>\],.;]+$/, "");
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
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function imageScore(value: string) {
  const normalized = value.toLowerCase();
  let score = 1;

  if (normalized.includes("down-id.img.susercontent.com/file/")) score += 40;
  if (/\/file\/id-/i.test(normalized)) score += 20;
  if (normalized.includes("/file/")) score += 10;
  if (normalized.includes("_tn")) score -= 3;

  return score;
}

function pickBestImage(candidates: string[]) {
  const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

  uniqueCandidates.sort((left, right) => imageScore(right) - imageScore(left));
  return uniqueCandidates[0] ?? "";
}

function extractMetaImages(text: string, baseUrl: string) {
  const candidates: string[] = [];
  const metaPattern = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = metaPattern.exec(text)) !== null) {
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
      candidates.push(imageUrl);
    }
  }

  return candidates;
}

function extractImageKeys(text: string) {
  const candidates: string[] = [];
  const keyPattern =
    /(?:"|')?(?:image|image_url|imageUrl|cover|thumbnail)(?:"|')?\s*[:=]\s*(?:"|')([^"']{20,300})(?:"|')/gi;
  let match: RegExpExecArray | null;
  let checked = 0;

  while ((match = keyPattern.exec(text)) !== null && checked < 100) {
    checked += 1;
    const rawValue = decodeTransportEscapes(match[1] ?? "").trim();

    if (!rawValue || /^https?:\/\//i.test(rawValue)) {
      continue;
    }

    const imageKey = rawValue.replace(/^\/+/, "");

    if (
      imageKey.length >= 20 &&
      imageKey.length <= 220 &&
      !/[\s<>]/.test(imageKey) &&
      !isBlockedImageUrl(imageKey)
    ) {
      candidates.push(
        `https://down-id.img.susercontent.com/file/${imageKey}`,
      );
    }
  }

  return candidates;
}

function extractProductImage(text: string, baseUrl: string) {
  if (!text) {
    return "";
  }

  const decodedText = decodeTransportEscapes(text);
  const candidates = extractMetaImages(decodedText, baseUrl);
  const urlPattern = /https?:\/\/[^\s"'<>\\)\]]+/gi;
  let match: RegExpExecArray | null;
  let checked = 0;

  while ((match = urlPattern.exec(decodedText)) !== null && checked < 280) {
    checked += 1;
    const imageUrl = normalizeProductImageUrl(match[0], baseUrl);

    if (imageUrl) {
      candidates.push(imageUrl);
    }
  }

  for (const imageKeyUrl of extractImageKeys(decodedText)) {
    const imageUrl = normalizeProductImageUrl(imageKeyUrl, baseUrl);

    if (imageUrl) {
      candidates.push(imageUrl);
    }
  }

  return pickBestImage(candidates);
}

async function readLimitedText(response: Response, byteLimit: number) {
  if (!response.body) {
    return (await response.text()).slice(0, byteLimit);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let output = "";
  let totalBytes = 0;

  try {
    while (totalBytes < byteLimit) {
      const { done, value } = await reader.read();

      if (done || !value) {
        break;
      }

      const remaining = byteLimit - totalBytes;
      const chunk =
        value.byteLength > remaining ? value.subarray(0, remaining) : value;

      output += decoder.decode(chunk, { stream: true });
      totalBytes += chunk.byteLength;

      if (chunk.byteLength < value.byteLength) {
        break;
      }
    }
  } finally {
    output += decoder.decode();

    try {
      await reader.cancel();
    } catch {
      // Stream telah selesai atau sudah ditutup.
    }
  }

  return output;
}

type ImageLookupResult = {
  imageUrl: string;
  resolvedUrl: string | null;
  source: "direct" | "microlink" | "jina" | null;
  warning: string | null;
};

async function fetchDirectImage(
  targetUrl: string,
  signal: AbortSignal,
): Promise<ImageLookupResult> {
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: REQUEST_HEADERS,
      redirect: "follow",
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return {
        imageUrl: "",
        resolvedUrl: response.url || targetUrl,
        source: null,
        warning: `Shopee mengembalikan HTTP ${response.status}.`,
      };
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType && !contentType.includes("text/html")) {
      await response.body?.cancel().catch(() => undefined);
      return {
        imageUrl: "",
        resolvedUrl: response.url || targetUrl,
        source: null,
        warning: "Respons Shopee bukan halaman HTML.",
      };
    }

    const resolvedUrl = response.url || targetUrl;
    const text = await readLimitedText(response, DIRECT_RESPONSE_LIMIT);
    const imageUrl = extractProductImage(text, resolvedUrl);

    return {
      imageUrl,
      resolvedUrl,
      source: imageUrl ? "direct" : null,
      warning: imageUrl ? null : "Metadata gambar tidak ada pada halaman langsung.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    return {
      imageUrl: "",
      resolvedUrl: targetUrl,
      source: null,
      warning: "Halaman langsung Shopee tidak dapat dibaca.",
    };
  }
}

function readMicrolinkImage(payload: unknown, baseUrl: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "";
  }

  const root = payload as Record<string, unknown>;

  if (root.status !== "success") {
    return "";
  }

  const data =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null;

  if (!data) {
    return "";
  }

  const imageValue = data.image;
  let rawImage = "";

  if (typeof imageValue === "string") {
    rawImage = imageValue;
  } else if (
    imageValue &&
    typeof imageValue === "object" &&
    !Array.isArray(imageValue)
  ) {
    const imageRecord = imageValue as Record<string, unknown>;
    const candidate = imageRecord.url ?? imageRecord.src ?? imageRecord.href;
    rawImage = typeof candidate === "string" ? candidate : "";
  }

  return normalizeProductImageUrl(rawImage, baseUrl);
}

async function fetchMicrolinkImage(
  targetUrl: string,
  signal: AbortSignal,
): Promise<ImageLookupResult> {
  const endpoint = new URL("https://api.microlink.io/");
  endpoint.searchParams.set("url", targetUrl);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "follow",
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return {
        imageUrl: "",
        resolvedUrl: targetUrl,
        source: null,
        warning:
          response.status === 429
            ? "Fallback preview sedang dibatasi; mencoba browser reader."
            : `Fallback preview mengembalikan HTTP ${response.status}.`,
      };
    }

    const text = await readLimitedText(response, 180_000);
    let payload: unknown;

    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      return {
        imageUrl: "",
        resolvedUrl: targetUrl,
        source: null,
        warning: "Respons fallback preview tidak valid.",
      };
    }

    const imageUrl = readMicrolinkImage(payload, targetUrl);

    return {
      imageUrl,
      resolvedUrl: targetUrl,
      source: imageUrl ? "microlink" : null,
      warning: imageUrl ? null : "Fallback preview tidak menemukan gambar produk.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    return {
      imageUrl: "",
      resolvedUrl: targetUrl,
      source: null,
      warning: "Fallback preview tidak dapat diakses.",
    };
  }
}

async function fetchJinaImage(
  targetUrl: string,
  signal: AbortSignal,
): Promise<ImageLookupResult> {
  const endpoint = `https://r.jina.ai/${targetUrl}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "X-Engine": "browser",
        "X-No-Cache": "true",
        "X-Timeout": "16",
      },
      // Cloudflare Workers hanya menerima follow atau manual.
      redirect: "follow",
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return {
        imageUrl: "",
        resolvedUrl: targetUrl,
        source: null,
        warning:
          response.status === 429
            ? "Browser reader sedang dibatasi. Coba ulang beberapa saat lagi."
            : `Browser reader mengembalikan HTTP ${response.status}.`,
      };
    }

    const text = await readLimitedText(response, EXTERNAL_RESPONSE_LIMIT);
    const imageUrl = extractProductImage(text, targetUrl);

    return {
      imageUrl,
      resolvedUrl: targetUrl,
      source: imageUrl ? "jina" : null,
      warning: imageUrl ? null : "Browser reader tidak menemukan gambar produk.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    return {
      imageUrl: "",
      resolvedUrl: targetUrl,
      source: null,
      warning: "Browser reader tidak dapat mengakses halaman Shopee.",
    };
  }
}

function createPreview(
  affiliateUrl: string,
  options: {
    resolvedUrl?: string | null;
    imageUrl?: string;
    errorCode?: AffiliateProductFetchErrorCode | null;
    message: string;
    warnings?: string[];
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
    warnings: options.warnings ?? [],
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
  const warnings: string[] = [];

  try {
    const directResult = await fetchDirectImage(normalizedUrl, controller.signal);

    if (directResult.imageUrl) {
      return createPreview(affiliateUrl, {
        resolvedUrl: directResult.resolvedUrl,
        imageUrl: directResult.imageUrl,
        message: "Link gambar produk berhasil diambil langsung dari Shopee.",
      });
    }

    if (directResult.warning) {
      warnings.push(directResult.warning);
    }

    // Jalur ini mempertahankan metode yang sebelumnya berhasil membaca
    // gambar dari link pendek, tetapi hanya mengambil satu field image_url.
    const microlinkResult = await fetchMicrolinkImage(
      normalizedUrl,
      controller.signal,
    );

    if (microlinkResult.imageUrl) {
      return createPreview(affiliateUrl, {
        resolvedUrl: microlinkResult.resolvedUrl,
        imageUrl: microlinkResult.imageUrl,
        message: "Link gambar produk berhasil diambil.",
      });
    }

    if (microlinkResult.warning) {
      warnings.push(microlinkResult.warning);
    }

    const jinaResult = await fetchJinaImage(normalizedUrl, controller.signal);

    if (jinaResult.imageUrl) {
      return createPreview(affiliateUrl, {
        resolvedUrl: jinaResult.resolvedUrl,
        imageUrl: jinaResult.imageUrl,
        message: "Link gambar produk berhasil diambil melalui browser reader.",
      });
    }

    if (jinaResult.warning) {
      warnings.push(jinaResult.warning);
    }

    return createPreview(affiliateUrl, {
      resolvedUrl: normalizedUrl,
      errorCode: "metadata-not-found",
      message:
        "Gambar produk belum ditemukan. Ikon aplikasi Shopee otomatis diabaikan.",
      warnings: Array.from(new Set(warnings)),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";

    return createPreview(affiliateUrl, {
      resolvedUrl: normalizedUrl,
      errorCode: timedOut ? "request-timeout" : "fetch-failed",
      message: timedOut
        ? "Pengambilan gambar melewati batas waktu. Coba ulang link ini."
        : "Link gambar Shopee gagal diproses.",
      warnings: Array.from(new Set(warnings)),
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
