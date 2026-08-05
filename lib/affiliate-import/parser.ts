import {
  MAX_AFFILIATE_LINKS,
  type AffiliateLinkKind,
  type AffiliateLinkParseResult,
  type ParsedAffiliateLink,
} from "@/lib/affiliate-import/types";

const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"'`]+|(?:(?:s\.)?shopee\.co\.id|shope\.ee|(?:[a-z0-9-]+\.)?shp\.ee)\/[^\s<>"'`]+/gi;

const DIRECT_SHOPEE_HOSTS = new Set([
  "shopee.co.id",
  "www.shopee.co.id",
]);

const SHORTLINK_SHOPEE_HOSTS = new Set([
  "s.shopee.co.id",
  "shope.ee",
]);

function trimUrlPunctuation(value: string) {
  let result = value.trim();

  while (/[),.;:!?\]}。；，！？]$/.test(result)) {
    result = result.slice(0, -1);
  }

  return result;
}

function addMissingProtocol(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^www\./i.test(value)) {
    return `https://${value}`;
  }

  return `https://${value}`;
}

function isShpEeHostname(hostname: string) {
  return hostname === "shp.ee" || hostname.endsWith(".shp.ee");
}

function getLinkKind(hostname: string): AffiliateLinkKind | null {
  if (SHORTLINK_SHOPEE_HOSTS.has(hostname) || isShpEeHostname(hostname)) {
    return "affiliate-shortlink";
  }

  if (DIRECT_SHOPEE_HOSTS.has(hostname)) {
    return "direct-shopee-link";
  }

  return null;
}

function normalizeUrl(value: string) {
  const cleanedValue = trimUrlPunctuation(value).replace(/&amp;/gi, "&");
  const parsedUrl = new URL(addMissingProtocol(cleanedValue));

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("unsupported-protocol");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("credentials-not-allowed");
  }

  parsedUrl.protocol = "https:";
  parsedUrl.hostname = parsedUrl.hostname.toLowerCase();

  if (parsedUrl.hostname === "www.shopee.co.id") {
    parsedUrl.hostname = "shopee.co.id";
  }

  parsedUrl.hash = "";

  if (parsedUrl.pathname.length > 1) {
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, "");
  }

  return parsedUrl;
}

function createInvalidRow({
  id,
  lineNumber,
  rawValue,
  issueCode,
  message,
}: {
  id: string;
  lineNumber: number;
  rawValue: string;
  issueCode: ParsedAffiliateLink["issueCode"];
  message: string;
}): ParsedAffiliateLink {
  return {
    id,
    lineNumber,
    rawValue,
    normalizedUrl: null,
    hostname: null,
    marketplace: null,
    kind: null,
    status: "invalid",
    issueCode,
    message,
    duplicateOfLine: null,
  };
}

function extractCandidates(input: string) {
  const candidates: Array<{
    id: string;
    lineNumber: number;
    rawValue: string;
    extractedUrl: string | null;
  }> = [];

  input.split(/\r?\n/).forEach((rawLine, lineIndex) => {
    const value = rawLine.trim();

    if (!value) {
      return;
    }

    const matches = Array.from(value.matchAll(URL_PATTERN));

    if (matches.length === 0) {
      candidates.push({
        id: `line-${lineIndex + 1}-item-1`,
        lineNumber: lineIndex + 1,
        rawValue: value,
        extractedUrl: null,
      });
      return;
    }

    matches.forEach((match, matchIndex) => {
      candidates.push({
        id: `line-${lineIndex + 1}-item-${matchIndex + 1}`,
        lineNumber: lineIndex + 1,
        rawValue: value,
        extractedUrl: match[0] ?? null,
      });
    });
  });

  return candidates;
}

export function parseAffiliateLinks(input: string): AffiliateLinkParseResult {
  const candidates = extractCandidates(input);
  const seenUrls = new Map<string, number>();
  let extractedLinkCount = 0;

  const rows = candidates.map<ParsedAffiliateLink>((candidate) => {
    if (!candidate.extractedUrl) {
      return createInvalidRow({
        id: candidate.id,
        lineNumber: candidate.lineNumber,
        rawValue: candidate.rawValue,
        issueCode: "missing-url",
        message: "Tidak ditemukan URL pada baris ini.",
      });
    }

    extractedLinkCount += 1;

    if (extractedLinkCount > MAX_AFFILIATE_LINKS) {
      return createInvalidRow({
        id: candidate.id,
        lineNumber: candidate.lineNumber,
        rawValue: candidate.rawValue,
        issueCode: "limit-exceeded",
        message: `Maksimal ${MAX_AFFILIATE_LINKS} link dalam satu proses.`,
      });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = normalizeUrl(candidate.extractedUrl);
    } catch {
      return createInvalidRow({
        id: candidate.id,
        lineNumber: candidate.lineNumber,
        rawValue: candidate.rawValue,
        issueCode: "invalid-url",
        message: "Format URL tidak valid.",
      });
    }

    const hostname = parsedUrl.hostname;
    const kind = getLinkKind(hostname);

    if (!kind) {
      return {
        ...createInvalidRow({
          id: candidate.id,
          lineNumber: candidate.lineNumber,
          rawValue: candidate.rawValue,
          issueCode: "unsupported-domain",
          message: "Domain belum didukung. Gunakan link Shopee Indonesia.",
        }),
        normalizedUrl: parsedUrl.toString(),
        hostname,
      };
    }

    if (parsedUrl.pathname === "/" && !parsedUrl.search) {
      return {
        ...createInvalidRow({
          id: candidate.id,
          lineNumber: candidate.lineNumber,
          rawValue: candidate.rawValue,
          issueCode: "homepage-url",
          message: "Link mengarah ke homepage, bukan ke produk.",
        }),
        normalizedUrl: parsedUrl.toString(),
        hostname,
        marketplace: "shopee",
        kind,
      };
    }

    const normalizedUrl = parsedUrl.toString();
    const duplicateOfLine = seenUrls.get(normalizedUrl);

    if (duplicateOfLine !== undefined) {
      return {
        id: candidate.id,
        lineNumber: candidate.lineNumber,
        rawValue: candidate.rawValue,
        normalizedUrl,
        hostname,
        marketplace: "shopee",
        kind,
        status: "duplicate",
        issueCode: "duplicate-url",
        message: `Duplikat dari baris ${duplicateOfLine}.`,
        duplicateOfLine,
      };
    }

    seenUrls.set(normalizedUrl, candidate.lineNumber);

    return {
      id: candidate.id,
      lineNumber: candidate.lineNumber,
      rawValue: candidate.rawValue,
      normalizedUrl,
      hostname,
      marketplace: "shopee",
      kind,
      status: "valid",
      issueCode: null,
      message:
        kind === "affiliate-shortlink"
          ? "Format short link Shopee siap diproses."
          : "Link Shopee langsung; tracking affiliate belum dapat diverifikasi.",
      duplicateOfLine: null,
    };
  });

  const validRows = rows.filter(
    (row): row is ParsedAffiliateLink & { normalizedUrl: string } =>
      row.status === "valid" && Boolean(row.normalizedUrl),
  );

  const affiliateShortlinkCount = validRows.filter(
    (row) => row.kind === "affiliate-shortlink",
  ).length;
  const directLinkCount = validRows.filter(
    (row) => row.kind === "direct-shopee-link",
  ).length;
  const duplicateCount = rows.filter(
    (row) => row.status === "duplicate",
  ).length;
  const invalidCount = rows.filter((row) => row.status === "invalid").length;

  return {
    rows,
    validLinks: validRows.map((row) => row.normalizedUrl),
    summary: {
      totalCandidates: rows.length,
      readyCount: validRows.length,
      affiliateShortlinkCount,
      directLinkCount,
      duplicateCount,
      invalidCount,
      limitExceeded: extractedLinkCount > MAX_AFFILIATE_LINKS,
    },
  };
}
