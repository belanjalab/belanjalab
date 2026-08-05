import type { FeaturedProduct } from "@/lib/products";
import {
  ArrowRightIcon,
  CompareIcon,
  RefreshIcon,
  SparklesIcon,
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
      ? `${product.priceSourceCount} sumber harga`
      : "Sumber harga belum tersedia";
  const scorePercentage =
    product.scoreValue === null
      ? 0
      : Math.min(100, Math.max(0, product.scoreValue * 10));

  return (
    <article className="decision-card group flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/5">
      <div className="relative p-3 pb-0 sm:p-4 sm:pb-0">
        <div className="absolute left-5 top-5 z-10 flex max-w-[calc(100%_-_2.5rem)] flex-wrap gap-2 sm:left-6 sm:top-6">
          <span className="rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-xs font-extrabold text-slate-700 shadow-sm backdrop-blur">
            {product.category}
          </span>
          {product.brand && (
            <span className="rounded-full border border-white/80 bg-slate-950/90 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm backdrop-blur">
              {product.brand}
            </span>
          )}
        </div>

        <a
          href={`/product/${product.slug}`}
          aria-label={`Buka analisis ${product.name}`}
          className="flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100 sm:h-56"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.035] sm:p-7"
          />
        </a>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="brand-text-balance text-base font-extrabold leading-6 tracking-[-0.02em] text-slate-950 sm:text-lg sm:leading-7">
          <a href={`/product/${product.slug}`} className="hover:text-orange-800">
            {product.name}
          </a>
        </h3>

        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-3.5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-700 shadow-sm ring-1 ring-orange-100">
              <SparklesIcon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-orange-800">
                {product.topStrength ? "Kekuatan utama" : "Ringkasan analisis"}
              </p>
              <p className="mt-1 text-sm font-extrabold leading-5 text-slate-950">
                {product.topStrength
                  ? `${product.topStrength.label} ${product.topStrength.value.toFixed(1)}/10`
                  : "Rincian penilaian sedang disiapkan"}
              </p>
              {product.shortDescription && (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-slate-600">
                  {product.shortDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
            <p className="text-xs font-bold text-emerald-800">BelanjaLab Score</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="text-lg font-extrabold tracking-[-0.025em] text-emerald-900">
                {product.score}
              </p>
              <p className="pb-0.5 text-xs font-bold text-emerald-800">
                {product.scoreVerdict}
              </p>
            </div>
            <div
              role="progressbar"
              aria-label={`BelanjaLab Score ${product.name}`}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={product.scoreValue ?? undefined}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100"
            >
              <span
                className="block h-full rounded-full bg-emerald-700"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-xs font-bold text-slate-500">Harga mulai</p>
            <p className="mt-1 text-sm font-extrabold leading-5 tracking-[-0.02em] text-slate-950 sm:text-base">
              {product.price}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold leading-4 text-slate-500">
              <StoreIcon className="h-3.5 w-3.5 shrink-0" />
              {priceSourceLabel}
            </p>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs font-semibold leading-5 text-slate-500">
          <RefreshIcon className="h-4 w-4 shrink-0 text-slate-400" />
          {product.priceFreshness}
        </p>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 pt-5">
          <a
            href={`/product/${product.slug}`}
            aria-label={`Lihat analisis lengkap ${product.name}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-extrabold text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
          >
            Lihat analisis <ArrowRightIcon />
          </a>
          <a
            href={compareHref}
            aria-label={`Tambahkan ${product.name} ke perbandingan`}
            title="Tambahkan ke perbandingan"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
          >
            <CompareIcon className="h-5 w-5" />
            <span className="sr-only">Bandingkan</span>
          </a>
        </div>
      </div>
    </article>
  );
}
