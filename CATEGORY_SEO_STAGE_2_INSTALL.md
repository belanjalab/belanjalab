# BelanjaLab Category SEO Stage 2

Overlay this package at the repository root.

## Changes

- Adds crawlable subcategory landing pages under `/kategori/[slug]/[subslug]`.
- Adds brand, minimum price, maximum price, and sorting filters.
- Filtered/faceted URLs are `noindex,follow` and canonicalized to the landing page.
- Adds internal links from category pages to subcategories that actually contain products.
- Adds BreadcrumbList, CollectionPage, and ItemList structured data.
- Adds subcategory URLs to sitemap only when matching published products exist.
- Pagination keeps active filters.
- Restores/keeps `CategoryIconKey` compatibility.

## No database migration required

The feature uses the existing categories, brands, products, product_scores, and product_prices tables.

## Test after deploy

- /kategori/gadget
- /kategori/gadget/smartphone
- /kategori/gadget?brand=samsung
- /kategori/gadget?min=1000000&max=5000000&sort=score-desc
- /sitemap.xml

Some configured subcategory URLs return 404 until matching published products exist. This is intentional to avoid empty SEO pages.

## Commit

feat(seo): add category filters and subcategory landing pages
