import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  SearchIcon,
  ScoreIcon,
} from "@/components/home/home-icons";
import MobileBottomNav from "@/components/site/mobile-bottom-nav";
import PageIntro from "@/components/site/page-intro";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getActiveSiteFooter } from "@/lib/footer";
import {
  DEFAULT_SEARCH_PAGE_SIZE,
  searchProducts,
  type SearchProductsResult,
} from "@/lib/search-products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cari Produk",
  description: "Cari produk, merek, dan kategori di BelanjaLab.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildSearchPageUrl(query: string, page: number) {
  const params = new URLSearchParams({ q: query });

  if (page > 1) {
    params.set("page", String(page));
  }

  return `/search?${params.toString()}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

const emptySearchResult: SearchProductsResult = {
  products: [],
  total: 0,
  page: 1,
  pageSize: DEFAULT_SEARCH_PAGE_SIZE,
  totalPages: 0,
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = getFirstParam(params.q);
  const query = rawQuery?.trim() ?? "";
  const requestedPage = parsePage(getFirstParam(params.page));
  const [result, footer] = await Promise.all([
    query.length >= 2
      ? searchProducts(query, { page: requestedPage })
      : Promise.resolve(emptySearchResult),
    getActiveSiteFooter(),
  ]);
  const { products, total, page, pageSize, totalPages } = result;
  const firstItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItem = total > 0 ? Math.min(page * pageSize, total) : 0;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <>
      <SiteHeader active="search" />

      <main id="konten-utama" className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">
        <PageIntro
          eyebrow="Pencarian produk"
          title={
            query.length >= 2
              ? `Hasil untuk “${query}”`
              : "Cari produk yang sesuai kebutuhanmu"
          }
          description={
            query.length >= 2
              ? `${total} produk ditemukan${
                  total > 0 ? ` · Menampilkan ${firstItem}–${lastItem}` : ""
                }`
              : "Cari berdasarkan nama produk, merek, kategori, atau kebutuhan. Gunakan minimal dua karakter."
          }
          compact
        >
          <form action="/search" method="get" role="search" className="flex max-w-3xl items-center rounded-2xl border border-slate-300 bg-white p-1.5 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.45)] transition focus-within:border-orange-700 focus-within:ring-4 focus-within:ring-orange-100">
            <label htmlFor="search" className="sr-only">
              Cari produk, merek, atau kategori
            </label>
            <span aria-hidden="true" className="ml-2 hidden text-slate-500 sm:inline-flex">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input
              id="search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Cari produk, merek, atau kategori..."
              minLength={2}
              maxLength={80}
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none sm:text-base"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-extrabold text-white transition-colors hover:bg-orange-800 sm:px-5"
            >
              Cari
              <ArrowRightIcon className="h-[18px] w-[18px]" />
            </button>
          </form>
        </PageIntro>

        <section className="px-4 pb-12 md:px-5 md:pb-16">
          <div className="mx-auto max-w-7xl">
            {query.length >= 2 && products.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="public-card group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg"
                  >
                    <Link href={`/product/${product.slug}`} className="block">
                      <div className="flex aspect-square items-center justify-center bg-slate-50 p-4 ring-1 ring-inset ring-slate-100 sm:p-6">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    </Link>

                    <div className="p-3.5 sm:p-4">
                      <p className="text-xs font-semibold leading-5 text-slate-500">
                        {product.brand} · {product.category}
                      </p>

                      <Link href={`/product/${product.slug}`}>
                        <h2 className="mt-1.5 line-clamp-2 min-h-10 text-sm font-extrabold leading-5 tracking-[-0.015em] text-slate-950 transition-colors hover:text-orange-800 sm:min-h-12 sm:text-base sm:leading-6">
                          {product.name}
                        </h2>
                      </Link>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm">
                        {product.shortDescription}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-500">Harga mulai</p>
                          <p className="mt-1 truncate text-sm font-extrabold text-slate-950 sm:text-base">
                            {product.formattedPrice}
                          </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-800 ring-1 ring-emerald-100">
                          <ScoreIcon className="h-3.5 w-3.5" />
                          {product.score !== null
                            ? product.score.toFixed(1)
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {query.length >= 2 && totalPages > 1 && (
              <nav
                aria-label="Navigasi hasil pencarian"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                {page > 1 ? (
                  <Link
                    href={buildSearchPageUrl(query, page - 1)}
                    className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold hover:border-orange-300 hover:text-orange-800"
                  >
                    Sebelumnya
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 cursor-not-allowed items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-400">
                    Sebelumnya
                  </span>
                )}

                {visiblePages.map((pageNumber, index) => {
                  const previousPage = visiblePages[index - 1];
                  const showEllipsis =
                    previousPage !== undefined && pageNumber - previousPage > 1;

                  return (
                    <span key={pageNumber} className="flex items-center gap-2">
                      {showEllipsis && (
                        <span className="px-1 text-sm text-slate-400">…</span>
                      )}
                      <Link
                        href={buildSearchPageUrl(query, pageNumber)}
                        aria-current={pageNumber === page ? "page" : undefined}
                        className={`flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-extrabold ${
                          pageNumber === page
                            ? "bg-orange-700 text-white"
                            : "border border-slate-200 bg-white hover:border-orange-300 hover:text-orange-800"
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    </span>
                  );
                })}

                {page < totalPages ? (
                  <Link
                    href={buildSearchPageUrl(query, page + 1)}
                    className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold hover:border-orange-300 hover:text-orange-800"
                  >
                    Berikutnya
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 cursor-not-allowed items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-400">
                    Berikutnya
                  </span>
                )}
              </nav>
            )}

            {query.length >= 2 && total === 0 && (
              <div className="public-card rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                  <SearchIcon className="h-7 w-7" />
                </span>
                <h2 className="mt-4 text-xl font-extrabold tracking-[-0.02em] text-slate-950">
                  Produk belum ditemukan
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Coba gunakan kata kunci lebih singkat, nama merek, atau kategori produk.
                </p>
                <Link
                  href="/#kategori"
                  className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white hover:bg-slate-800"
                >
                  Jelajahi kategori
                </Link>
              </div>
            )}

            {query.length < 2 && (
              <div>
                <div className="mb-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                    Coba pencarian ini
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                    Mulai dari produk, merek, atau kategori
                  </h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                  {[
                    ["Mouse gaming", "Cari berdasarkan jenis produk"],
                    ["Samsung", "Cari berdasarkan merek"],
                    ["Gadget", "Cari berdasarkan kategori"],
                  ].map(([keyword, description]) => (
                    <Link
                      key={keyword}
                      href={`/search?q=${encodeURIComponent(keyword)}`}
                      className="public-card group flex min-h-28 items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-200"
                    >
                      <div>
                        <p className="text-base font-extrabold text-slate-950">{keyword}</p>
                        <p className="mt-1 text-sm text-slate-600">{description}</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-orange-700 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter footer={footer} />
      <MobileBottomNav active="search" />
    </>
  );
}
