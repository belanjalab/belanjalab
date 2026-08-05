export const MAX_AFFILIATE_LINKS = 100;
export const MAX_AFFILIATE_SCAN_BATCH_SIZE = 10;
export const AFFILIATE_SCAN_CLIENT_BATCH_SIZE = 5;

export type AffiliateMarketplace = "shopee";

export type AffiliateLinkStatus = "valid" | "duplicate" | "invalid";

export type AffiliateLinkKind =
  | "affiliate-shortlink"
  | "direct-shopee-link";

export type AffiliateLinkIssueCode =
  | "missing-url"
  | "invalid-url"
  | "unsupported-domain"
  | "homepage-url"
  | "duplicate-url"
  | "limit-exceeded";

export type ParsedAffiliateLink = {
  id: string;
  lineNumber: number;
  rawValue: string;
  normalizedUrl: string | null;
  hostname: string | null;
  marketplace: AffiliateMarketplace | null;
  kind: AffiliateLinkKind | null;
  status: AffiliateLinkStatus;
  issueCode: AffiliateLinkIssueCode | null;
  message: string;
  duplicateOfLine: number | null;
};

export type AffiliateLinkParseSummary = {
  totalCandidates: number;
  readyCount: number;
  affiliateShortlinkCount: number;
  directLinkCount: number;
  duplicateCount: number;
  invalidCount: number;
  limitExceeded: boolean;
};

export type AffiliateLinkParseResult = {
  rows: ParsedAffiliateLink[];
  validLinks: string[];
  summary: AffiliateLinkParseSummary;
};

export type AffiliateProductFetchStatus =
  | "success"
  | "partial"
  | "failed";

export type AffiliateProductFetchErrorCode =
  | "invalid-request"
  | "unsupported-url"
  | "redirect-failed"
  | "redirect-domain-blocked"
  | "request-timeout"
  | "http-error"
  | "unsupported-content"
  | "metadata-not-found"
  | "fetch-failed";

export type AffiliateProductPreview = {
  id: string;
  marketplace: AffiliateMarketplace;
  affiliateUrl: string;
  resolvedUrl: string | null;
  status: AffiliateProductFetchStatus;
  errorCode: AffiliateProductFetchErrorCode | null;
  message: string;
  warnings: string[];
  name: string;
  description: string;
  imageUrl: string;
  price: number | null;
  priceMax: number | null;
  currency: string | null;
  shopId: string | null;
  itemId: string | null;
  fetchedAt: string;
};

export type AffiliateProductScanRequest = {
  links: string[];
};

export type AffiliateProductScanSummary = {
  requestedCount: number;
  successCount: number;
  partialCount: number;
  failedCount: number;
};

export type AffiliateProductScanResponse = {
  items: AffiliateProductPreview[];
  summary: AffiliateProductScanSummary;
};

export type AffiliateProductScanErrorResponse = {
  error: string;
};
