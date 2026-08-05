type UnknownRecord = Record<string, unknown>;

export type ShopeeProductApiMetadata = {
  name: string;
  description: string;
  imageUrl: string;
  price: number | null;
  priceMax: number | null;
  currency: "IDR";
  canonicalUrl: string;
  source: "pdp-get-pc" | "item-get";
};

type FetchShopeeProductApiInput = {
  shopId: string;
  itemId: string;
  refererUrl: string;
  signal: AbortSignal;
};

const MAX_API_RESPONSE_BYTES = 5_000_000;
const SHOPEE_PRICE_SCALE = 100_000;

const API_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "X-Api-Source": "pc",
  "X-Requested-With": "XMLHttpRequest",
  "X-Shopee-Language": "id",
  Origin: "https://shopee.co.id",
} as const;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function getString(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getNumericId(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(Math.trunc(value));
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
      return value.trim();
    }
  }

  return null;
}

function hasPriceField(record: UnknownRecord) {
  return [
    "price",
    "price_min",
    "price_max",
    "current_price",
    "sale_price",
    "promotion_price",
  ].some((key) => record[key] !== undefined && record[key] !== null);
}

function scoreProductRecord(
  record: UnknownRecord,
  expectedShopId: string,
  expectedItemId: string,
) {
  const shopId = getNumericId(record, ["shopid", "shop_id", "shopId"]);
  const itemId = getNumericId(record, ["itemid", "item_id", "itemId"]);
  const name = getString(record, ["title", "name", "item_name", "itemName"]);
  const image = record.image ?? record.images ?? record.image_url;

  let score = 0;

  if (shopId === expectedShopId) score += 12;
  if (itemId === expectedItemId) score += 18;
  if (shopId && shopId !== expectedShopId) score -= 8;
  if (itemId && itemId !== expectedItemId) score -= 12;
  if (name) score += 4;
  if (image) score += 3;
  if (hasPriceField(record)) score += 4;
  if (Array.isArray(record.models)) score += 2;

  return score;
}

function findProductRecord(
  payload: unknown,
  expectedShopId: string,
  expectedItemId: string,
) {
  let bestRecord: UnknownRecord | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  let visits = 0;

  const visit = (value: unknown, depth: number) => {
    if (depth > 7 || visits > 15_000) {
      return;
    }

    visits += 1;

    if (Array.isArray(value)) {
      value.forEach((child) => visit(child, depth + 1));
      return;
    }

    const record = asRecord(value);

    if (!record) {
      return;
    }

    const score = scoreProductRecord(record, expectedShopId, expectedItemId);

    if (score > bestScore) {
      bestScore = score;
      bestRecord = record;
    }

    Object.values(record).forEach((child) => visit(child, depth + 1));
  };

  visit(payload, 0);

  return bestScore >= 7 ? bestRecord : null;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isLikelyProductName(value: string) {
  const normalized = normalizeWhitespace(value);

  return Boolean(
    normalized.length >= 3 &&
      normalized.length <= 500 &&
      !/^\d+$/.test(normalized) &&
      !/^shopee(?: indonesia)?$/i.test(normalized),
  );
}

function isLikelyProductImageUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname.toLowerCase();

    if (/\.(?:css|js|mjs|map|json|woff2?|ttf|otf|eot)(?:$|\?)/i.test(pathname)) {
      return false;
    }

    return (
      /\.(?:avif|gif|jpe?g|png|webp)(?:$|\?)/i.test(pathname) ||
      parsed.hostname.toLowerCase().endsWith("susercontent.com") ||
      parsed.hostname.toLowerCase().includes("img.shopee")
    );
  } catch {
    return false;
  }
}

function parseDisplayPrice(value: string) {
  const cleaned = value
    .replace(/\s+/g, "")
    .replace(/rp/gi, "")
    .replace(/[^\d,.]/g, "");

  if (!cleaned) {
    return null;
  }

  const integerLike = cleaned.replace(/[.,]/g, "");
  const parsed = Number(integerLike);

  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function parseShopeeInternalPrice(value: unknown) {
  if (typeof value === "string" && /[^\d.-]/.test(value)) {
    return parseDisplayPrice(value);
  }

  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  // Endpoint internal Shopee menyimpan harga dalam satuan 1/100.000 rupiah.
  // Nilai kecil dipertahankan agar parser tetap aman bila format respons berubah.
  const normalized =
    numericValue >= SHOPEE_PRICE_SCALE * 10
      ? numericValue / SHOPEE_PRICE_SCALE
      : numericValue;

  return normalized > 0 ? Math.round(normalized) : null;
}

const CURRENT_PRICE_KEYS = new Set([
  "price",
  "price_min",
  "price_max",
  "current_price",
  "sale_price",
  "promotion_price",
]);

const FALLBACK_PRICE_KEYS = new Set([
  "price_min_before_discount",
  "price_max_before_discount",
  "price_before_discount",
  "original_price",
]);

function collectPriceValues(
  value: unknown,
  acceptedKeys: Set<string>,
  depth = 0,
  output: number[] = [],
) {
  if (depth > 5 || output.length > 500) {
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((child) =>
      collectPriceValues(child, acceptedKeys, depth + 1, output),
    );
    return output;
  }

  const record = asRecord(value);

  if (!record) {
    return output;
  }

  for (const [key, child] of Object.entries(record)) {
    if (acceptedKeys.has(key)) {
      const price = parseShopeeInternalPrice(child);

      if (price !== null) {
        output.push(price);
      }
    }

    if (
      depth < 5 &&
      (key === "models" ||
        key === "model_list" ||
        key === "item" ||
        key === "price_info" ||
        key === "promotion" ||
        key === "data")
    ) {
      collectPriceValues(child, acceptedKeys, depth + 1, output);
    }
  }

  return output;
}

function normalizeImageUrl(value: unknown) {
  let candidate = "";

  if (typeof value === "string") {
    candidate = value.trim();
  } else if (Array.isArray(value)) {
    candidate = value.find(
      (entry): entry is string => typeof entry === "string" && Boolean(entry.trim()),
    )?.trim() ?? "";
  }

  if (!candidate) {
    return "";
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  if (candidate.startsWith("//")) {
    return `https:${candidate}`;
  }

  const imageKey = candidate.replace(/^\/+/, "");
  return `https://down-id.img.susercontent.com/file/${imageKey}`;
}

function extractImage(record: UnknownRecord) {
  return normalizeImageUrl(
    record.image ??
      record.images ??
      record.image_url ??
      record.imageUrl ??
      record.cover ??
      record.thumbnail,
  );
}

function parseApiPayload(
  payload: unknown,
  shopId: string,
  itemId: string,
  source: ShopeeProductApiMetadata["source"],
): ShopeeProductApiMetadata | null {
  const topLevel = asRecord(payload);
  const errorValue = topLevel?.error;

  if (
    errorValue !== undefined &&
    errorValue !== null &&
    errorValue !== 0 &&
    errorValue !== false
  ) {
    return null;
  }

  const product = findProductRecord(payload, shopId, itemId);

  if (!product) {
    return null;
  }

  const rawName = normalizeWhitespace(
    getString(product, ["title", "name", "item_name", "itemName"]),
  );
  const name = isLikelyProductName(rawName) ? rawName : "";
  const description = normalizeWhitespace(
    getString(product, ["description", "description_text", "desc"]),
  );
  const rawImageUrl = extractImage(product);
  const imageUrl = isLikelyProductImageUrl(rawImageUrl) ? rawImageUrl : "";
  const currentPrices = collectPriceValues(product, CURRENT_PRICE_KEYS)
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);
  const fallbackPrices =
    currentPrices.length > 0
      ? []
      : collectPriceValues(product, FALLBACK_PRICE_KEYS)
          .filter((price) => Number.isFinite(price) && price > 0)
          .sort((a, b) => a - b);
  const prices = currentPrices.length > 0 ? currentPrices : fallbackPrices;
  const price = prices[0] ?? null;
  const highestPrice = prices.at(-1) ?? null;
  const priceMax =
    price !== null && highestPrice !== null && highestPrice > price
      ? highestPrice
      : null;

  if (!name && !imageUrl && price === null) {
    return null;
  }

  return {
    name,
    description,
    imageUrl,
    price,
    priceMax,
    currency: "IDR",
    canonicalUrl: `https://shopee.co.id/product/${shopId}/${itemId}`,
    source,
  };
}

async function readJsonPayload(response: Response) {
  const contentLength = Number(response.headers.get("content-length") ?? "0");

  if (contentLength > MAX_API_RESPONSE_BYTES) {
    return null;
  }

  const text = await response.text();

  if (!text || text.length > MAX_API_RESPONSE_BYTES) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function fetchShopeeProductApiMetadata({
  shopId,
  itemId,
  refererUrl,
  signal,
}: FetchShopeeProductApiInput): Promise<ShopeeProductApiMetadata | null> {
  const endpoints: Array<{
    url: URL;
    source: ShopeeProductApiMetadata["source"];
  }> = [
    {
      url: new URL(
        `/api/v4/pdp/get_pc?shop_id=${encodeURIComponent(shopId)}&item_id=${encodeURIComponent(itemId)}&detail_level=0&tz_offset_minutes=420`,
        "https://shopee.co.id",
      ),
      source: "pdp-get-pc",
    },
    {
      url: new URL(
        `/api/v4/item/get?shopid=${encodeURIComponent(shopId)}&itemid=${encodeURIComponent(itemId)}`,
        "https://shopee.co.id",
      ),
      source: "item-get",
    },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: "GET",
        headers: {
          ...API_HEADERS,
          Referer: refererUrl,
        },
        redirect: "error",
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        await response.body?.cancel().catch(() => undefined);
        continue;
      }

      const payload = await readJsonPayload(response);
      const parsed = parseApiPayload(payload, shopId, itemId, endpoint.source);

      if (parsed) {
        return parsed;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }

      // Endpoint berikutnya tetap dicoba. Kegagalan API tidak boleh
      // menggagalkan metadata HTML yang sudah berhasil diambil.
    }
  }

  return null;
}
