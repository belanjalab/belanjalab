export const MAX_AFFILIATE_LINKS = 100;

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
