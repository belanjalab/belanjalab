type JsonRecord = Record<string, unknown>;

type ParsedOffer = {
  price: number | null;
  priceMax: number | null;
  currency: string | null;
};

export type ParsedAffiliateProductMetadata = {
  name: string;
  description: string;
  imageUrl: string;
  price: number | null;
  priceMax: number | null;
  currency: string | null;
  canonicalUrl: string | null;
};

const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  ndash: "–",
  mdash: "—",
};

const PROMOTIONAL_PRICE_WORDS = [
  "voucher",
  "cashback",
  "diskon",
  "potongan",
  "komisi",
  "ongkir",
  "hemat",
  "koin",
];

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      const valueFromCode = Number.parseInt(code, 16);
      return Number.isFinite(valueFromCode)
        ? String.fromCodePoint(valueFromCode)
        : "";
    })
    .replace(/&#(\d+);/g, (_, code: string) => {
      const valueFromCode = Number.parseInt(code, 10);
      return Number.isFinite(valueFromCode)
        ? String.fromCodePoint(valueFromCode)
        : "";
    })
    .replace(/&([a-z]+);/gi, (match, entity: string) => {
      return HTML_ENTITY_MAP[entity.toLowerCase()] ?? match;
    });
}

function decodeEscapedHtml(value: string) {
  return value
    .replace(/\\u002[fF]/g, "/")
    .replace(/\\u003[aA]/g, ":")
    .replace(/\\u0026/g, "&")
    .replace(/\\u003[dD]/g, "=")
    .replace(/\\u002[dD]/g, "-")
    .replace(/\\\//g, "/");
}

function normalizeWhitespace(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function stripTags(value: string) {
  return normalizeWhitespace(value.replace(/<[^>]*>/g, " "));
}

function parseAttributes(tag: string) {
  const attributes = new Map<string, string>();
  const attributePattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of tag.matchAll(attributePattern)) {
    const name = match[1]?.toLowerCase();

    if (!name || name === "meta" || name === "link" || name === "script") {
      continue;
    }

    attributes.set(name, match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attributes;
}

function collectMetaValues(html: string) {
  const values = new Map<string, string>();

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const key =
      attributes.get("property") ??
      attributes.get("name") ??
      attributes.get("itemprop");
    const content = attributes.get("content");

    if (!key || !content) {
      continue;
    }

    const normalizedKey = key.toLowerCase();

    if (!values.has(normalizedKey)) {
      values.set(normalizedKey, normalizeWhitespace(content));
    }
  }

  return values;
}

function getFirstMetaValue(
  metaValues: Map<string, string>,
  keys: string[],
) {
  for (const key of keys) {
    const value = metaValues.get(key.toLowerCase());

    if (value) {
      return value;
    }
  }

  return "";
}

function extractCanonicalUrl(html: string) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const rel = attributes.get("rel")?.toLowerCase();
    const href = attributes.get("href");

    if (rel?.split(/\s+/).includes("canonical") && href) {
      return decodeHtmlEntities(href).trim();
    }
  }

  return null;
}

function extractDocumentTitle(html: string) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? stripTags(match[1]) : "";
}

function extractHeading(html: string) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match?.[1] ? stripTags(match[1]) : "";
}

function cleanupProductName(value: string) {
  return normalizeWhitespace(value)
    .replace(/^jual\s+/i, "")
    .replace(/\s*[|｜-]\s*shopee(?:\s+indonesia)?\s*$/i, "")
    .trim();
}

function parsePriceNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/[^\d.,-]/g, "").trim();

  if (!cleaned) {
    return null;
  }

  let numericValue: number;

  if (/^-?\d{1,3}(?:[.,]\d{3})+$/.test(cleaned)) {
    numericValue = Number(cleaned.replace(/[.,]/g, ""));
  } else if (/^-?\d+[.,]\d{1,2}$/.test(cleaned)) {
    numericValue = Number(cleaned.replace(",", "."));
  } else {
    numericValue = Number(cleaned.replace(/[.,]/g, ""));
  }

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.round(numericValue);
}

function getJsonLdNodes(html: string) {
  const nodes: JsonRecord[] = [];

  for (const scriptMatch of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    const attributes = parseAttributes(`<script ${scriptMatch[1] ?? ""}>`);
    const type = attributes.get("type")?.toLowerCase();

    if (type !== "application/ld+json") {
      continue;
    }

    const rawJson = decodeHtmlEntities(scriptMatch[2] ?? "")
      .replace(/^\s*<!--/, "")
      .replace(/-->\s*$/, "")
      .trim()
      .replace(/;\s*$/, "");

    if (!rawJson) {
      continue;
    }

    try {
      const parsed = JSON.parse(rawJson) as unknown;
      collectJsonLdRecords(parsed, nodes);
    } catch {
      // Metadata Open Graph tetap dapat digunakan ketika JSON-LD rusak.
    }
  }

  return nodes;
}

function collectJsonLdRecords(value: unknown, target: JsonRecord[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdRecords(item, target));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  target.push(value);

  const graph = value["@graph"];

  if (graph) {
    collectJsonLdRecords(graph, target);
  }

  const mainEntity = value.mainEntity;

  if (mainEntity) {
    collectJsonLdRecords(mainEntity, target);
  }
}

function isProductNode(node: JsonRecord) {
  const type = node["@type"];

  if (typeof type === "string") {
    return type.toLowerCase() === "product";
  }

  return (
    Array.isArray(type) &&
    type.some(
      (entry) =>
        typeof entry === "string" && entry.toLowerCase() === "product",
    )
  );
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? normalizeWhitespace(value) : "";
}

function getImageValue(value: unknown): string {
  if (typeof value === "string") {
    return decodeHtmlEntities(value).trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const image = getImageValue(item);

      if (image) {
        return image;
      }
    }

    return "";
  }

  if (isRecord(value)) {
    return (
      getImageValue(value.url) ||
      getImageValue(value.contentUrl) ||
      getImageValue(value.thumbnailUrl)
    );
  }

  return "";
}

function getOfferFromRecord(offer: JsonRecord): ParsedOffer {
  const aggregatePrice = isRecord(offer.priceSpecification)
    ? offer.priceSpecification.price
    : null;

  return {
    price:
      parsePriceNumber(offer.lowPrice) ??
      parsePriceNumber(offer.price) ??
      parsePriceNumber(aggregatePrice),
    priceMax:
      parsePriceNumber(offer.highPrice) ?? parsePriceNumber(offer.price),
    currency:
      getStringValue(offer.priceCurrency) ||
      (isRecord(offer.priceSpecification)
        ? getStringValue(offer.priceSpecification.priceCurrency)
        : "") ||
      null,
  };
}

function extractOffer(value: unknown): ParsedOffer {
  const emptyOffer: ParsedOffer = {
    price: null,
    priceMax: null,
    currency: null,
  };

  if (Array.isArray(value)) {
    const offers = value
      .filter(isRecord)
      .map(getOfferFromRecord)
      .filter((offer) => offer.price !== null);

    if (offers.length === 0) {
      return emptyOffer;
    }

    const prices = offers
      .map((offer) => offer.price)
      .filter((price): price is number => price !== null);
    const maximumPrices = offers.flatMap((offer) =>
      offer.priceMax === null ? [] : [offer.priceMax],
    );

    return {
      price: Math.min(...prices),
      priceMax:
        maximumPrices.length > 0
          ? Math.max(...maximumPrices)
          : Math.max(...prices),
      currency: offers.find((offer) => offer.currency)?.currency ?? null,
    };
  }

  return isRecord(value) ? getOfferFromRecord(value) : emptyOffer;
}

function extractJsonLdProduct(html: string) {
  const productNode = getJsonLdNodes(html).find(isProductNode);

  if (!productNode) {
    return null;
  }

  return {
    name: getStringValue(productNode.name),
    description: getStringValue(productNode.description),
    imageUrl: getImageValue(productNode.image),
    offer: extractOffer(productNode.offers),
    url: getStringValue(productNode.url),
  };
}

function extractFallbackImage(html: string) {
  const decodedHtml = decodeEscapedHtml(html);
  const candidates = Array.from(
    decodedHtml.matchAll(
      /https?:\/\/[^\s"'<>\\]+(?:susercontent\.com|shopeemobile\.com)[^\s"'<>\\]*/gi,
    ),
  )
    .map((match) => decodeHtmlEntities(match[0] ?? ""))
    .map((value) => value.replace(/[),.;]+$/, ""))
    .filter(Boolean);

  return (
    candidates.find((url) => /\/file\//i.test(url)) ?? candidates[0] ?? ""
  );
}

function extractFallbackPrice(html: string) {
  const withoutScripts = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  const visibleText = stripTags(withoutScripts);
  const pricePattern =
    /Rp\s*([0-9][0-9.,]*)(?:\s*(?:-|–|—|sampai)\s*(?:Rp\s*)?([0-9][0-9.,]*))?/gi;

  for (const match of visibleText.matchAll(pricePattern)) {
    const matchIndex = match.index ?? 0;
    const context = visibleText
      .slice(Math.max(0, matchIndex - 80), matchIndex)
      .toLowerCase();

    if (PROMOTIONAL_PRICE_WORDS.some((word) => context.includes(word))) {
      continue;
    }

    const price = parsePriceNumber(match[1]);
    const priceMax = parsePriceNumber(match[2]);

    if (price !== null) {
      return {
        price,
        priceMax: priceMax ?? price,
      };
    }
  }

  return {
    price: null,
    priceMax: null,
  };
}

function normalizeAbsoluteUrl(value: string, baseUrl?: string) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

export function parseAffiliateProductMetadata(
  html: string,
  pageUrl: string,
): ParsedAffiliateProductMetadata {
  const metaValues = collectMetaValues(html);
  const jsonLdProduct = extractJsonLdProduct(html);
  const fallbackPrice = extractFallbackPrice(html);

  const name = cleanupProductName(
    jsonLdProduct?.name ||
      getFirstMetaValue(metaValues, ["og:title", "twitter:title"]) ||
      extractHeading(html) ||
      extractDocumentTitle(html),
  );

  const description = normalizeWhitespace(
    jsonLdProduct?.description ||
      getFirstMetaValue(metaValues, [
        "og:description",
        "twitter:description",
        "description",
      ]),
  );

  const rawImageUrl =
    jsonLdProduct?.imageUrl ||
    getFirstMetaValue(metaValues, [
      "og:image:secure_url",
      "og:image",
      "twitter:image",
      "twitter:image:src",
    ]) ||
    extractFallbackImage(html);

  const metaPrice = parsePriceNumber(
    getFirstMetaValue(metaValues, [
      "product:price:amount",
      "og:price:amount",
      "product:low_price:amount",
    ]),
  );
  const metaPriceMax = parsePriceNumber(
    getFirstMetaValue(metaValues, [
      "product:high_price:amount",
      "product:sale_price:amount",
    ]),
  );

  const price = jsonLdProduct?.offer.price ?? metaPrice ?? fallbackPrice.price;
  const priceMax =
    jsonLdProduct?.offer.priceMax ??
    metaPriceMax ??
    fallbackPrice.priceMax ??
    price;
  const currency =
    jsonLdProduct?.offer.currency ||
    getFirstMetaValue(metaValues, [
      "product:price:currency",
      "og:price:currency",
    ]) ||
    (price !== null ? "IDR" : null);

  const canonicalUrl = normalizeAbsoluteUrl(
    jsonLdProduct?.url ||
      getFirstMetaValue(metaValues, ["og:url"]) ||
      extractCanonicalUrl(html) ||
      "",
    pageUrl,
  );

  return {
    name,
    description,
    imageUrl: normalizeAbsoluteUrl(rawImageUrl, pageUrl),
    price,
    priceMax,
    currency,
    canonicalUrl: canonicalUrl || null,
  };
}

export function extractShopeeProductIds(value: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return {
      shopId: null,
      itemId: null,
    };
  }

  const decodedPathname = safeDecodeURIComponent(parsedUrl.pathname);
  const itemPathMatch = decodedPathname.match(/-i\.(\d+)\.(\d+)(?:\b|\/|$)/i);

  if (itemPathMatch) {
    return {
      shopId: itemPathMatch[1] ?? null,
      itemId: itemPathMatch[2] ?? null,
    };
  }

  const productPathMatch = decodedPathname.match(
    /\/product\/(\d+)\/(\d+)(?:\b|\/|$)/i,
  );

  if (productPathMatch) {
    return {
      shopId: productPathMatch[1] ?? null,
      itemId: productPathMatch[2] ?? null,
    };
  }

  // Short link Shopee terbaru dapat berakhir pada format:
  // /nama-toko/{shopId}/{itemId}__mobile__=1&...
  // Query affiliate kadang ditempel ke segmen item, jadi cukup ambil
  // dua kelompok angka pertama setelah nama toko.
  const sharedProductPathMatch = decodedPathname.match(
    /\/[^/?#]+\/(\d{5,})\/(\d{5,})(?:[^0-9]|$)/i,
  );

  if (sharedProductPathMatch) {
    return {
      shopId: sharedProductPathMatch[1] ?? null,
      itemId: sharedProductPathMatch[2] ?? null,
    };
  }

  return {
    shopId:
      parsedUrl.searchParams.get("shopid") ??
      parsedUrl.searchParams.get("shop_id"),
    itemId:
      parsedUrl.searchParams.get("itemid") ??
      parsedUrl.searchParams.get("item_id"),
  };
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function deriveProductNameFromUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    const decodedPathname = safeDecodeURIComponent(parsedUrl.pathname);
    const lastSegment = decodedPathname.split("/").filter(Boolean).at(-1) ?? "";
    const slug = lastSegment
      .replace(/-i\.\d+\.\d+.*$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!slug) {
      return "";
    }

    return `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  } catch {
    return "";
  }
}

export function extractEmbeddedShopeeProductUrl(
  value: string,
  baseUrl: string,
) {
  const decodedValue = decodeEscapedHtml(decodeHtmlEntities(value));
  const absoluteMatch = decodedValue.match(
    /https?:\/\/(?:[a-z0-9-]+\.)?shopee\.co\.id\/[^\s"'<>]+-i\.\d+\.\d+[^\s"'<>]*/i,
  );

  if (absoluteMatch?.[0]) {
    return normalizeAbsoluteUrl(absoluteMatch[0].replace(/[),.;]+$/, ""));
  }

  const relativeMatch = decodedValue.match(
    /\/[^\s"'<>]+-i\.\d+\.\d+[^\s"'<>]*/i,
  );

  if (relativeMatch?.[0]) {
    return normalizeAbsoluteUrl(relativeMatch[0].replace(/[),.;]+$/, ""), baseUrl);
  }

  return "";
}
