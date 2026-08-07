import type { CategoryBrowseFilters, CategorySort } from "@/lib/categories";

export type CategorySearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveNumber(value: string | undefined) {
  if (!value) return null;

  const normalized = value.replace(/[^0-9]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : null;
}

function parseSort(value: string | undefined): CategorySort {
  const allowed = new Set<CategorySort>([
    "recommended",
    "score-desc",
    "price-asc",
    "price-desc",
    "newest",
  ]);

  return allowed.has(value as CategorySort)
    ? (value as CategorySort)
    : "recommended";
}

export function parseCategoryPage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(firstValue(value) ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseCategoryFilters(
  query: CategorySearchParams,
): CategoryBrowseFilters {
  return {
    brand: firstValue(query.brand)?.trim() ?? "",
    minPrice: parsePositiveNumber(firstValue(query.min)),
    maxPrice: parsePositiveNumber(firstValue(query.max)),
    sort: parseSort(firstValue(query.sort)),
  };
}

export function hasCategoryFacets(filters: CategoryBrowseFilters) {
  return Boolean(
    filters.brand ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      (filters.sort && filters.sort !== "recommended"),
  );
}

export function categoryFiltersToQuery(
  filters: CategoryBrowseFilters,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (filters.brand) query.brand = filters.brand;
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    query.min = String(filters.minPrice);
  }
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    query.max = String(filters.maxPrice);
  }
  if (filters.sort && filters.sort !== "recommended") {
    query.sort = filters.sort;
  }

  return query;
}
