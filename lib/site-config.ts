export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
  "https://belanjalab.com";

export const PRODUCT_PLACEHOLDER_PATH =
  "/images/products/product-placeholder.svg";

export function toAbsoluteSiteUrl(pathOrUrl: string | null | undefined) {
  const value = pathOrUrl?.trim();

  if (!value) {
    return `${SITE_URL}${PRODUCT_PLACEHOLDER_PATH}`;
  }

  try {
    return new URL(value, `${SITE_URL}/`).toString();
  } catch {
    return `${SITE_URL}${PRODUCT_PLACEHOLDER_PATH}`;
  }
}
