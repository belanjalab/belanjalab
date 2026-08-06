type JinaReaderSource = "jina-reader" | "jina-shopee-search";

export type JinaReaderMetadata = {
  name: string;
  description: string;
  imageUrl: string;
  price: number | null;
  priceMax: number | null;
  currency: "IDR" | null;
  canonicalUrl: string | null;
  source: JinaReaderSource;
};

export type JinaReaderResult = {
  metadata: JinaReaderMetadata | null;
  warning: string | null;
};

type FetchJinaReaderMetadataInput = {
  url: string;
  productName: string;
  shopId: string | null;
  itemId: string | null;
  signal: AbortSignal;
};

type PriceCandidate = {
  price: number;
  priceMax: number | null;
  score: number;
  lineIndex: number;
};

const JINA_READER_ENDPOINT = "https://r.jina.ai/";
const MAX_RESPONSE_BYTES = 3_000_000;
const MIN_REASONABLE_PRICE = 100;
const MAX_REASONABLE_PRICE = 5_000_000_000;
const PRICE_PATTERN =
  /Rp\s*([0-9][0-9.,]*)(?:\s*(?:-|–|—|sampai|hingga)\s*(?:Rp\s*)?([0-9][0-9.,]*))?/gi;
const PROMOTIONAL_CONTEXT_WORDS = [
  "voucher",
  "cashback",
  "diskon",
  "potongan",
  "komisi",
  "ongkir",
  "hemat",
  "koin",
  "cicilan",
  "minimum belanja",
  "min. belanja",
  "belanja rp",
  "s/d rp",
  "promo",
  "klaim",
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeHttpUrl(value: string) {
  const candidate = value.trim().replace(/^<|>$/g, "");

  if (!candidate) {
    return "";
  }

  try {
    const parsed = new URL(
      candidate.startsWith("//") ? `https:${candidate}` : candidate,
    );

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "";
    }

    parsed.protocol = "https:";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function isShopeeUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === "shopee.co.id" || hostname.endsWith(".shopee.co.id");
  } catch {
    return false;
  }
}

function isLikelyProductImageUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    return Boolean(
      hostname.endsWith("susercontent.com") ||
        hostname.includes("img.shopee") ||
        /\.(?:avif|gif|jpe?g|png|webp)(?:$|\?)/i.test(pathname),
    );
  } catch {
    return false;
  }
}

function isLikelyProductName(value: string) {
  const normalized = normalizeWhitespace(value)
    .replace(/^jual\s+/i, "")
    .replace(/\s*[|｜-]\s*shopee(?:\s+indonesia)?\s*$/i, "")
    .trim();
  const lowerValue = normalized.toLowerCase();

  return Boolean(
    normalized.length >= 3 &&
      normalized.length <= 500 &&
      !/^\d+$/.test(normalized) &&
      ![
        "shopee",
        "shopee indonesia",
        "login",
        "masuk",
        "download aplikasi shopee",
      ].includes(lowerValue),
  );
}

function cleanupProductName(value: string) {
  return normalizeWhitespace(value)
    .replace(/^#+\s*/, "")
    .replace(/^jual\s+/i, "")
    .replace(/\s*[|｜-]\s*shopee(?:\s+indonesia)?\s*$/i, "")
    .trim();
}

function parseIndonesianPrice(value: string) {
  const cleaned = value
    .replace(/\s+/g, "")
    .replace(/rp/gi, "")
    .replace(/[^\d.,]/g, "");

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned.replace(/[.,]/g, ""));

  if (
    !Number.isFinite(parsed) ||
    parsed < MIN_REASONABLE_PRICE ||
    parsed > MAX_REASONABLE_PRICE
  ) {
    return null;
  }

  return Math.round(parsed);
}

function getPriceCandidates(lines: string[]) {
  const candidates: PriceCandidate[] = [];
  const firstHeadingIndex = lines.findIndex((line) => /^#\s+\S/.test(line));

  lines.forEach((line, lineIndex) => {
    if (!line || lineIndex > 350) {
      return;
    }

    PRICE_PATTERN.lastIndex = 0;

    for (const match of line.matchAll(PRICE_PATTERN)) {
      const price = parseIndonesianPrice(match[1] ?? "");

      if (price === null) {
        continue;
      }

      const parsedPriceMax = parseIndonesianPrice(match[2] ?? "");
      const priceMax =
        parsedPriceMax !== null && parsedPriceMax > price
          ? parsedPriceMax
          : null;
      const previousLine = lines[lineIndex - 1] ?? "";
      const matchIndex = match.index ?? 0;
      const pricePrefix = line.slice(Math.max(0, matchIndex - 100), matchIndex);
      const context = `${previousLine} ${pricePrefix}`.toLowerCase();

      if (PROMOTIONAL_CONTEXT_WORDS.some((word) => context.includes(word))) {
        continue;
      }

      let score = 0;
      const trimmedLine = line.trim();

      if (/^rp\s*[0-9][0-9.,]*(?:\s*(?:-|–|—|sampai|hingga)\s*(?:rp\s*)?[0-9][0-9.,]*)?$/i.test(trimmedLine)) {
        score += 12;
      }

      if (lineIndex <= 120) score += 5;
      if (lineIndex <= 50) score += 3;
      if (trimmedLine.length <= 80) score += 2;
      if (priceMax !== null) score += 1;

      if (
        firstHeadingIndex >= 0 &&
        lineIndex > firstHeadingIndex &&
        lineIndex - firstHeadingIndex <= 45
      ) {
        score += 5;
      }

      if (/harga/i.test(previousLine) && !/harga coret|sebelum/i.test(previousLine)) {
        score += 1;
      }

      candidates.push({ price, priceMax, score, lineIndex });
    }
  });

  return candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.lineIndex - b.lineIndex;
  });
}

function extractName(lines: string[]) {
  const titleLine = lines.find((line) => /^Title:\s*\S/i.test(line));
  const title = titleLine?.replace(/^Title:\s*/i, "") ?? "";
  const heading =
    lines.find((line) => /^#\s+\S/.test(line))?.replace(/^#\s+/, "") ?? "";
  const candidate = cleanupProductName(title || heading);

  return isLikelyProductName(candidate) ? candidate : "";
}

function extractCanonicalUrl(lines: string[], fallbackUrl: string) {
  const sourceLine = lines.find((line) => /^URL Source:\s*https?:\/\//i.test(line));
  const sourceUrl = normalizeHttpUrl(
    sourceLine?.replace(/^URL Source:\s*/i, "") ?? "",
  );

  if (sourceUrl && isShopeeUrl(sourceUrl)) {
    return sourceUrl;
  }

  const normalizedFallback = normalizeHttpUrl(fallbackUrl);
  return normalizedFallback && isShopeeUrl(normalizedFallback)
    ? normalizedFallback
    : null;
}

function extractImageUrl(content: string) {
  const markdownImagePattern = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/gi;
  const rawUrlPattern = /https?:\/\/[^\s"'<>\\)]+/gi;
  const candidates = [
    ...Array.from(content.matchAll(markdownImagePattern)).map(
      (match) => match[1] ?? "",
    ),
    ...Array.from(content.matchAll(rawUrlPattern)).map(
      (match) => match[0] ?? "",
    ),
  ]
    .map((value) => normalizeHttpUrl(value.replace(/[),.;]+$/, "")))
    .filter(isLikelyProductImageUrl);

  return (
    candidates.find((value) => /susercontent\.com\/file\//i.test(value)) ??
    candidates[0] ??
    ""
  );
}

function extractDescription(lines: string[], productName: string) {
  const headingIndex = lines.findIndex((line) => {
    const cleaned = cleanupProductName(line);
    return cleaned === productName || line === `# ${productName}`;
  });

  if (headingIndex < 0) {
    return "";
  }

  for (let index = headingIndex + 1; index < Math.min(lines.length, headingIndex + 40); index += 1) {
    const line = normalizeWhitespace(lines[index] ?? "");

    if (
      line.length >= 40 &&
      line.length <= 1_500 &&
      !line.startsWith("![") &&
      !/^Rp\s/i.test(line) &&
      !/^Image:/i.test(line) &&
      !/^#+\s/.test(line)
    ) {
      return line;
    }
  }

  return "";
}

function parseReaderContent(
  content: string,
  fallbackUrl: string,
  source: JinaReaderSource,
  anchorItemId = "",
): JinaReaderMetadata | null {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const name = extractName(lines);
  const priceCandidates = getPriceCandidates(lines);
  const anchorLineIndex = anchorItemId
    ? lines.findIndex((line) => line.includes(anchorItemId))
    : -1;
  const priceCandidate =
    anchorLineIndex >= 0
      ? [...priceCandidates].sort((a, b) => {
          const scoreCandidate = (candidate: PriceCandidate) => {
            const distance = candidate.lineIndex - anchorLineIndex;

            if (distance >= 0 && distance <= 24) {
              return candidate.score + 40 - distance;
            }

            if (distance < 0 && distance >= -10) {
              return candidate.score + 14 + distance;
            }

            return candidate.score - Math.abs(distance);
          };

          return scoreCandidate(b) - scoreCandidate(a);
        })[0] ?? null
      : priceCandidates[0] ?? null;
  const imageUrl = extractImageUrl(content);
  const canonicalUrl = extractCanonicalUrl(lines, fallbackUrl);
  const description = name ? extractDescription(lines, name) : "";

  if (!name && !imageUrl && !priceCandidate) {
    return null;
  }

  return {
    name,
    description,
    imageUrl,
    price: priceCandidate?.price ?? null,
    priceMax: priceCandidate?.priceMax ?? null,
    currency: priceCandidate ? "IDR" : null,
    canonicalUrl,
    source,
  };
}

function findExactProductWindow(
  content: string,
  shopId: string | null,
  itemId: string | null,
) {
  if (!itemId) {
    return "";
  }

  const markers = [
    shopId ? `-i.${shopId}.${itemId}` : "",
    shopId ? `/product/${shopId}/${itemId}` : "",
    `.${itemId}`,
  ].filter(Boolean);
  const lowerContent = content.toLowerCase();

  for (const marker of markers) {
    const markerIndex = lowerContent.indexOf(marker.toLowerCase());

    if (markerIndex < 0) {
      continue;
    }

    return content.slice(
      Math.max(0, markerIndex - 900),
      Math.min(content.length, markerIndex + 1_800),
    );
  }

  return "";
}

async function readLimitedText(response: Response) {
  const contentLength = Number(response.headers.get("content-length") ?? "0");

  if (contentLength > MAX_RESPONSE_BYTES) {
    return "";
  }

  const text = await response.text();
  return text.length <= MAX_RESPONSE_BYTES ? text : "";
}

async function fetchReaderContent(url: string, signal: AbortSignal) {
  const targetUrl = normalizeHttpUrl(url);

  if (!targetUrl || !isShopeeUrl(targetUrl)) {
    return {
      content: "",
      warning: "URL tujuan untuk browser reader tidak valid.",
    };
  }

  const headers: Record<string, string> = {
    Accept: "text/plain",
    "X-Engine": "browser",
    "X-No-Cache": "true",
    "X-Timeout": "18",
  };
  const apiKey = process.env.JINA_API_KEY?.trim();

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(`${JINA_READER_ENDPOINT}${targetUrl}`, {
      method: "GET",
      headers,
      redirect: "error",
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return {
        content: "",
        warning: `Browser reader mengembalikan HTTP ${response.status}.`,
      };
    }

    const content = await readLimitedText(response);

    return {
      content,
      warning: content ? null : "Browser reader tidak mengembalikan konten.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    return {
      content: "",
      warning:
        error instanceof Error
          ? `Browser reader gagal: ${error.message}`
          : "Browser reader gagal mengambil halaman Shopee.",
    };
  }
}

export async function fetchJinaReaderMetadata({
  url,
  productName,
  shopId,
  itemId,
  signal,
}: FetchJinaReaderMetadataInput): Promise<JinaReaderResult> {
  const directResult = await fetchReaderContent(url, signal);
  const directMetadata = directResult.content
    ? parseReaderContent(directResult.content, url, "jina-reader")
    : null;

  if (directMetadata?.price !== null && directMetadata?.price !== undefined) {
    return {
      metadata: directMetadata,
      warning: directResult.warning,
    };
  }

  if (!productName || !itemId) {
    return {
      metadata: directMetadata,
      warning: directResult.warning,
    };
  }

  const searchUrl = `https://shopee.co.id/search?keyword=${encodeURIComponent(productName)}`;
  const searchResult = await fetchReaderContent(searchUrl, signal);
  const productWindow = findExactProductWindow(
    searchResult.content,
    shopId,
    itemId,
  );
  const searchMetadata = productWindow
    ? parseReaderContent(
        productWindow,
        url,
        "jina-shopee-search",
        itemId ?? "",
      )
    : null;
  const metadata = directMetadata || searchMetadata
    ? {
        name: directMetadata?.name || searchMetadata?.name || "",
        description:
          directMetadata?.description || searchMetadata?.description || "",
        imageUrl: directMetadata?.imageUrl || searchMetadata?.imageUrl || "",
        price: directMetadata?.price ?? searchMetadata?.price ?? null,
        priceMax:
          directMetadata?.priceMax ?? searchMetadata?.priceMax ?? null,
        currency:
          directMetadata?.currency ?? searchMetadata?.currency ?? null,
        canonicalUrl:
          directMetadata?.canonicalUrl || searchMetadata?.canonicalUrl || null,
        source:
          directMetadata?.price !== null && directMetadata?.price !== undefined
            ? directMetadata.source
            : searchMetadata?.source ?? directMetadata?.source ?? "jina-reader",
      }
    : null;
  const warnings = [directResult.warning, searchResult.warning].filter(Boolean);

  return {
    metadata,
    warning: warnings.length > 0 ? warnings.join(" ") : null,
  };
}
