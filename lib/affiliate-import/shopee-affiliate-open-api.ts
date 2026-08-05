type UnknownRecord = Record<string, unknown>;

export type ShopeeAffiliateOpenApiMetadata = {
  name: string;
  imageUrl: string;
  price: number | null;
  priceMax: number | null;
  currency: "IDR";
  canonicalUrl: string;
  offerUrl: string | null;
  shopName: string;
  source: "affiliate-open-api";
};

export type ShopeeAffiliateOpenApiResult = {
  configured: boolean;
  metadata: ShopeeAffiliateOpenApiMetadata | null;
  warning: string | null;
};

type FetchShopeeAffiliateOpenApiInput = {
  shopId: string;
  itemId: string;
  signal: AbortSignal;
};

type QueryResult = {
  ok: boolean;
  status: number;
  payload: unknown;
};

const DEFAULT_ENDPOINT =
  "https://open-api.affiliate.shopee.co.id/graphql";
const MAX_RESPONSE_BYTES = 2_000_000;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function asString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeId(value: unknown) {
  const candidate = asString(value);
  return /^\d+$/.test(candidate) ? candidate : "";
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

function normalizeHttpUrl(value: unknown) {
  const candidate = asString(value);

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

    if (
      pathname.includes("/assets/") &&
      !/\.(?:avif|gif|jpe?g|png|webp)(?:$|\?)/i.test(pathname)
    ) {
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

function parsePrice(value: unknown) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    const normalized = value >= 10_000_000_000 ? value / 100_000 : value;
    return Math.round(normalized);
  }

  if (typeof value !== "string") {
    return null;
  }

  const raw = value.trim();

  if (!raw) {
    return null;
  }

  const withoutCurrency = raw
    .replace(/\s+/g, "")
    .replace(/rp/gi, "")
    .replace(/[^\d.,-]/g, "");

  if (!withoutCurrency) {
    return null;
  }

  let numericValue: number;

  if (/^-?\d+(?:[.,]\d{1,2})$/.test(withoutCurrency)) {
    numericValue = Number(withoutCurrency.replace(",", "."));
  } else if (/^-?\d{1,3}(?:[.,]\d{3})+$/.test(withoutCurrency)) {
    numericValue = Number(withoutCurrency.replace(/[.,]/g, ""));
  } else {
    numericValue = Number(withoutCurrency.replace(/[.,]/g, ""));
  }

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  const normalized =
    numericValue >= 10_000_000_000 ? numericValue / 100_000 : numericValue;

  return Math.round(normalized);
}

async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function getConfiguration() {
  const appId = process.env.SHOPEE_AFFILIATE_APP_ID?.trim() ?? "";
  const appSecret =
    process.env.SHOPEE_AFFILIATE_APP_SECRET?.trim() ??
    process.env.SHOPEE_AFFILIATE_SECRET?.trim() ??
    "";
  const endpoint =
    process.env.SHOPEE_AFFILIATE_API_URL?.trim() || DEFAULT_ENDPOINT;

  return {
    appId,
    appSecret,
    endpoint,
    configured: Boolean(appId && appSecret),
  };
}

export function isShopeeAffiliateOpenApiConfigured() {
  return getConfiguration().configured;
}

function buildModernQuery(shopId: string, itemId: string) {
  return `query BelanjaLabProductOffer {
    productOfferV2(
      shopId: ${shopId}
      itemId: ${itemId}
      page: 1
      limit: 5
    ) {
      nodes {
        itemId
        shopId
        productName
        productLink
        offerLink
        imageUrl
        priceMin
        priceMax
        shopName
      }
    }
  }`;
}

function buildLegacyQuery(shopId: string, itemId: string) {
  return `query BelanjaLabProductOfferLegacy {
    productOfferV2(
      shopId: ${shopId}
      itemId: ${itemId}
      page: 1
      limit: 5
    ) {
      nodes {
        productId
        shopId
        productName
        productLink
        offerLink
        imageUrl
        price
        priceMin
        priceMax
        shopName
      }
    }
  }`;
}

function getGraphQlMessages(payload: unknown) {
  const root = asRecord(payload);
  const errors = root?.errors;

  if (!Array.isArray(errors)) {
    return [];
  }

  return errors
    .map(asRecord)
    .map((error) => asString(error?.message))
    .filter(Boolean);
}

function looksLikeSchemaMismatch(messages: string[]) {
  return messages.some((message) =>
    /cannot query field|unknown argument|unknown field|did you mean/i.test(message),
  );
}

function getProductNodes(payload: unknown) {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const connection = asRecord(data?.productOfferV2);
  const nodes = connection?.nodes;

  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes
    .map(asRecord)
    .filter((node): node is UnknownRecord => Boolean(node));
}

function scoreNode(
  node: UnknownRecord,
  expectedShopId: string,
  expectedItemId: string,
) {
  const shopId = normalizeId(node.shopId);
  const itemId = normalizeId(node.itemId ?? node.productId);
  let score = 0;

  if (shopId === expectedShopId) score += 12;
  if (itemId === expectedItemId) score += 20;
  if (shopId && shopId !== expectedShopId) score -= 10;
  if (itemId && itemId !== expectedItemId) score -= 20;
  if (isLikelyProductName(asString(node.productName))) score += 4;
  if (isLikelyProductImageUrl(normalizeHttpUrl(node.imageUrl))) score += 3;
  if (parsePrice(node.priceMin ?? node.price) !== null) score += 4;

  return score;
}

function findMatchingNode(
  payload: unknown,
  expectedShopId: string,
  expectedItemId: string,
) {
  return (
    getProductNodes(payload)
      .map((node) => ({
        node,
        score: scoreNode(node, expectedShopId, expectedItemId),
      }))
      .sort((left, right) => right.score - left.score)[0]?.node ?? null
  );
}

function parseProductNode(
  node: UnknownRecord,
  expectedShopId: string,
  expectedItemId: string,
): ShopeeAffiliateOpenApiMetadata | null {
  const rawName = normalizeWhitespace(asString(node.productName));
  const name = isLikelyProductName(rawName) ? rawName : "";
  const rawImageUrl = normalizeHttpUrl(node.imageUrl);
  const imageUrl = isLikelyProductImageUrl(rawImageUrl) ? rawImageUrl : "";
  const price = parsePrice(node.priceMin ?? node.price ?? node.priceMax);
  const parsedPriceMax = parsePrice(node.priceMax ?? node.price);
  const priceMax =
    price !== null && parsedPriceMax !== null && parsedPriceMax > price
      ? parsedPriceMax
      : null;
  const shopId = normalizeId(node.shopId) || expectedShopId;
  const itemId = normalizeId(node.itemId ?? node.productId) || expectedItemId;
  const productLink = normalizeHttpUrl(node.productLink);
  const offerLink = normalizeHttpUrl(node.offerLink);
  const canonicalUrl =
    productLink || `https://shopee.co.id/product/${shopId}/${itemId}`;

  if (!name && !imageUrl && price === null) {
    return null;
  }

  return {
    name,
    imageUrl,
    price,
    priceMax,
    currency: "IDR",
    canonicalUrl,
    offerUrl: offerLink || null,
    shopName: normalizeWhitespace(asString(node.shopName)),
    source: "affiliate-open-api",
  };
}

async function readJsonPayload(response: Response) {
  const contentLength = Number(response.headers.get("content-length") ?? "0");

  if (contentLength > MAX_RESPONSE_BYTES) {
    return null;
  }

  const text = await response.text();

  if (!text || text.length > MAX_RESPONSE_BYTES) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function executeQuery({
  endpoint,
  appId,
  appSecret,
  query,
  signal,
}: {
  endpoint: URL;
  appId: string;
  appSecret: string;
  query: string;
  signal: AbortSignal;
}): Promise<QueryResult> {
  const payload = JSON.stringify({ query });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = await sha256Hex(
    `${appId}${timestamp}${payload}${appSecret}`,
  );
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `SHA256 Credential=${appId},Timestamp=${timestamp},Signature=${signature}`,
      "Content-Type": "application/json",
    },
    body: payload,
    cache: "no-store",
    redirect: "error",
    signal,
  });
  const responsePayload = await readJsonPayload(response);

  return {
    ok: response.ok,
    status: response.status,
    payload: responsePayload,
  };
}

export async function fetchShopeeAffiliateOpenApiMetadata({
  shopId,
  itemId,
  signal,
}: FetchShopeeAffiliateOpenApiInput): Promise<ShopeeAffiliateOpenApiResult> {
  if (!/^\d+$/.test(shopId) || !/^\d+$/.test(itemId)) {
    return {
      configured: isShopeeAffiliateOpenApiConfigured(),
      metadata: null,
      warning: "Shop ID atau item ID Shopee tidak valid.",
    };
  }

  const configuration = getConfiguration();

  if (!configuration.configured) {
    return {
      configured: false,
      metadata: null,
      warning:
        "Shopee Affiliate Open API belum aktif. Tambahkan SHOPEE_AFFILIATE_APP_ID dan SHOPEE_AFFILIATE_APP_SECRET di Cloudflare.",
    };
  }

  let endpoint: URL;

  try {
    endpoint = new URL(configuration.endpoint);
  } catch {
    return {
      configured: true,
      metadata: null,
      warning: "SHOPEE_AFFILIATE_API_URL tidak valid.",
    };
  }

  if (endpoint.protocol !== "https:") {
    return {
      configured: true,
      metadata: null,
      warning: "Endpoint Shopee Affiliate Open API harus menggunakan HTTPS.",
    };
  }

  try {
    let result = await executeQuery({
      endpoint,
      appId: configuration.appId,
      appSecret: configuration.appSecret,
      query: buildModernQuery(shopId, itemId),
      signal,
    });
    let messages = getGraphQlMessages(result.payload);

    if (looksLikeSchemaMismatch(messages)) {
      result = await executeQuery({
        endpoint,
        appId: configuration.appId,
        appSecret: configuration.appSecret,
        query: buildLegacyQuery(shopId, itemId),
        signal,
      });
      messages = getGraphQlMessages(result.payload);
    }

    if (!result.ok) {
      const authenticationFailed =
        result.status === 401 ||
        result.status === 403 ||
        messages.some((message) =>
          /signature|credential|unauthor|forbidden/i.test(message),
        );

      return {
        configured: true,
        metadata: null,
        warning: authenticationFailed
          ? "Shopee menolak App ID atau App Secret. Periksa kredensial Open API di Cloudflare."
          : `Shopee Affiliate Open API mengembalikan HTTP ${result.status}.`,
      };
    }

    if (messages.length > 0) {
      const authenticationFailed = messages.some((message) =>
        /signature|credential|unauthor|forbidden/i.test(message),
      );

      return {
        configured: true,
        metadata: null,
        warning: authenticationFailed
          ? "Shopee menolak App ID atau App Secret. Periksa kredensial Open API di Cloudflare."
          : `Shopee Affiliate Open API: ${messages[0]}`,
      };
    }

    const node = findMatchingNode(result.payload, shopId, itemId);
    const metadata = node
      ? parseProductNode(node, shopId, itemId)
      : null;

    if (!metadata) {
      return {
        configured: true,
        metadata: null,
        warning:
          "Produk tidak ditemukan pada katalog offer akun Shopee Affiliate atau sedang tidak memiliki offer aktif.",
      };
    }

    return {
      configured: true,
      metadata,
      warning: null,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    return {
      configured: true,
      metadata: null,
      warning:
        error instanceof Error
          ? `Shopee Affiliate Open API gagal dihubungi: ${error.message}`
          : "Shopee Affiliate Open API gagal dihubungi.",
    };
  }
}
