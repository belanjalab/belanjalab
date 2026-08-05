const DEFAULT_SITE_URL = "https://belanjalab.com";

function normalizeSiteUrl(value: string | undefined) {
  const candidate = value?.trim().replace(/\/+$/, "");

  if (!candidate) {
    return DEFAULT_SITE_URL;
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
);

export const PRODUCT_PLACEHOLDER_PATH =
  "/images/products/product-placeholder.svg";

type PublicUrlOptions = {
  allowHash?: boolean;
  allowMailto?: boolean;
};

export function sanitizePublicUrl(
  value: string | null | undefined,
  options: PublicUrlOptions = {},
): string | null {
  const candidate = value?.trim();

  if (!candidate || /[\u0000-\u001f\u007f]/.test(candidate)) {
    return null;
  }

  if (
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("\\")
  ) {
    return candidate;
  }

  if (options.allowHash !== false && candidate.startsWith("#")) {
    return candidate;
  }

  try {
    const url = new URL(candidate);
    const allowedProtocols = new Set(["http:", "https:"]);

    if (options.allowMailto) {
      allowedProtocols.add("mailto:");
    }

    return allowedProtocols.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getSafeImageUrl(
  value: string | null | undefined,
  fallbackPath = PRODUCT_PLACEHOLDER_PATH,
) {
  return (
    sanitizePublicUrl(value, {
      allowHash: false,
      allowMailto: false,
    }) ?? fallbackPath
  );
}

export function toAbsoluteSiteUrl(
  pathOrUrl: string | null | undefined,
  fallbackPath = PRODUCT_PLACEHOLDER_PATH,
) {
  const safeValue = sanitizePublicUrl(pathOrUrl, {
    allowHash: false,
    allowMailto: false,
  });

  if (!safeValue) {
    return new URL(fallbackPath, `${SITE_URL}/`).toString();
  }

  try {
    const url = new URL(safeValue, `${SITE_URL}/`);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return new URL(fallbackPath, `${SITE_URL}/`).toString();
    }

    return url.toString();
  } catch {
    return new URL(fallbackPath, `${SITE_URL}/`).toString();
  }
}
