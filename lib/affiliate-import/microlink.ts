type UnknownRecord = Record<string, unknown>;

export type MicrolinkMetadata = {
  name: string;
  description: string;
  imageUrl: string;
  price: number | null;
  priceMax: number | null;
  currency: string | null;
  canonicalUrl: string | null;
  source: "microlink";
};

type FetchMicrolinkMetadataInput = {
  url: string;
  signal: AbortSignal;
};

const MICROLINK_ENDPOINT = "https://api.microlink.io/";
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

function isLikelyProductName(value: string) {
  const normalized = normalizeWhitespace(value);
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

function isLikelyProductImageUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    return Boolean(
      /\.(?:avif|gif|jpe?g|png|webp)(?:$|\?)/i.test(pathname) ||
        hostname.endsWith("susercontent.com") ||
        hostname.includes("img.shopee"),
    );
  } catch {
    return false;
  }
}

function parsePrice(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .replace(/\s+/g, "")
    .replace(/rp/gi, "")
    .replace(/[^\d,.]/g, "");

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned.replace(/[.,]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function getImageUrl(data: UnknownRecord) {
  const imageValue = data.image;

  if (typeof imageValue === "string") {
    return normalizeHttpUrl(imageValue);
  }

  const imageRecord = asRecord(imageValue);
  return normalizeHttpUrl(
    imageRecord?.url ?? imageRecord?.src ?? imageRecord?.href,
  );
}

function getPriceData(data: UnknownRecord) {
  const rawPrice = data.price;
  const priceRecord = asRecord(rawPrice);
  const price =
    parsePrice(rawPrice) ??
    parsePrice(priceRecord?.amount) ??
    parsePrice(priceRecord?.value) ??
    parsePrice(priceRecord?.min) ??
    null;
  const priceMax =
    parsePrice(priceRecord?.max) ??
    parsePrice(data.priceMax) ??
    parsePrice(data.highPrice) ??
    null;
  const currency =
    asString(priceRecord?.currency) ||
    asString(data.currency) ||
    (price !== null ? "IDR" : "");

  return {
    price,
    priceMax:
      price !== null && priceMax !== null && priceMax > price
        ? priceMax
        : null,
    currency: currency || null,
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

export async function fetchMicrolinkMetadata({
  url,
  signal,
}: FetchMicrolinkMetadataInput): Promise<MicrolinkMetadata | null> {
  let targetUrl: URL;

  try {
    targetUrl = new URL(url);
  } catch {
    return null;
  }

  if (
    targetUrl.protocol !== "https:" ||
    !(
      targetUrl.hostname === "shopee.co.id" ||
      targetUrl.hostname.endsWith(".shopee.co.id") ||
      targetUrl.hostname === "shope.ee" ||
      targetUrl.hostname.endsWith(".shope.ee") ||
      targetUrl.hostname === "shp.ee" ||
      targetUrl.hostname.endsWith(".shp.ee")
    )
  ) {
    return null;
  }

  const endpoint = new URL(MICROLINK_ENDPOINT);
  endpoint.searchParams.set("url", targetUrl.toString());

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      redirect: "error",
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return null;
    }

    const payload = await readJsonPayload(response);
    const payloadRecord = asRecord(payload);

    if (payloadRecord?.status !== "success") {
      return null;
    }

    const data = asRecord(payloadRecord.data);

    if (!data) {
      return null;
    }

    const rawName = normalizeWhitespace(
      asString(data.title) || asString(data.name),
    );
    const name = isLikelyProductName(rawName) ? rawName : "";
    const description = normalizeWhitespace(asString(data.description));
    const rawImageUrl = getImageUrl(data);
    const imageUrl = isLikelyProductImageUrl(rawImageUrl) ? rawImageUrl : "";
    const canonicalUrl = normalizeHttpUrl(data.url) || targetUrl.toString();
    const priceData = getPriceData(data);

    if (!name && !imageUrl && priceData.price === null) {
      return null;
    }

    return {
      name,
      description,
      imageUrl,
      price: priceData.price,
      priceMax: priceData.priceMax,
      currency: priceData.currency,
      canonicalUrl,
      source: "microlink",
    };
  } catch {
    return null;
  }
}
