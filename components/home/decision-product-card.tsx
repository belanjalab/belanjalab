import type { FeaturedProduct } from "@/lib/products";
import {
  ArrowRightIcon,
  CompareIcon,
  RefreshIcon,
  StoreIcon,
} from "@/components/home/home-icons";

type DecisionProductCardProps = {
  product: FeaturedProduct;
};

export default function DecisionProductCard({
  product,
}: DecisionProductCardProps) {
  const compareHref = `/compare?products=${encodeURIComponent(product.slug)}`;
  const priceSourceLabel =
    product.priceSourceCount > 0
      ? `${product.priceSourceCount} sumber`
      : "Sumber belum tersedia";
  const scorePercentage =
    product.scoreValue === null
      ? 0
      : Math.min(100, Math.max(0, product.scoreValue * 10));

  return (
    <article className="decision-card group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="relative">
        <a
          href={`/product/${product.slug}`}
          aria-label={`Buka analisis ${product.name}`}
          className="flex aspect-square items-center justify-center overflow-hidden bg-white p-4 sm:p-5"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.025]"
          />
        </a>

        <div className="absolute inset-x-2.5 top-2.5 z-10 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="max-w-[72%] truncate rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:max-w-[52%] sm:text-xs">
            {product.brand || product.category}
          </span>

          <span className="inline-flex max-w-[78%] self-end whitespace-nowrap rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm sm:max-w-none sm:self-auto sm:text-xs">
            Score {product.score}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-slate-100 p-3.5 sm:p-4">
        <p className="truncate text-xs font-medium text-slate-500">
          {product.category}
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 sm:min-h-12 sm:text-base sm:leading-6">
          <a href={`/product/${product.slug}`} className="transition-colors hover:text-slate-700">
            {product.name}
          </a>
        </h3>

        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5">
          <p className="text-xs font-medium text-amber-800">
            {product.topStrength ? "Unggul di" : "Ringkasan"}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs font-semibold leading-5 text-slate-800 sm:text-sm">
            {product.topStrength
              ? `${product.topStrength.label} · ${product.topStrength.value.toFixed(1)}/10`
              : product.scoreVerdict}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500">Harga mulai</p>
          <p className="mt-0.5 text-base font-semibold tracking-[-0.02em] text-slate-900 sm:text-lg">
            {product.price}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-xs leading-4 text-slate-500">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
            <StoreIcon className="h-3.5 w-3.5 shrink-0" />
            {priceSourceLabel}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <RefreshIcon className="h-3.5 w-3.5" />
            {product.priceFreshness}
          </span>
        </div>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-emerald-100">
          <span
            className="block h-full rounded-full bg-emerald-600"
            style={{ width: `${scorePercentage}%` }}
          />
        </div>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_42px] gap-2 pt-4">
          <a
            href={`/product/${product.slug}`}
            aria-label={`Lihat analisis lengkap ${product.name}`}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Lihat analisis <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a
            href={compareHref}
            aria-label={`Tambahkan ${product.name} ke perbandingan`}
            title="Tambahkan ke perbandingan"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          >
            <CompareIcon className="h-[18px] w-[18px]" />
            <span className="sr-only">Bandingkan</span>
          </a>
        </div>
      </div>
    </article>
  );
}
