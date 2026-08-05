import {
  ClockIcon,
  ExternalLinkIcon,
  StoreIcon,
  TagIcon,
} from "@/components/home/home-icons";
import type { MarketplaceOffer } from "@/lib/marketplace-prices";

type MarketplaceOffersProps = {
  offers: MarketplaceOffer[];
};

function formatCheckedAt(value: string | null) {
  if (!value) return "Belum pernah diperiksa";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Waktu pemeriksaan tidak valid";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStockLabel(status: string, isAvailable: boolean) {
  if (!isAvailable || status === "out_of_stock") return "Stok habis";
  if (status === "low_stock") return "Stok terbatas";
  if (status === "preorder") return "Preorder";
  if (status === "in_stock") return "Tersedia";
  return "Cek marketplace";
}

function getStockClass(status: string, isAvailable: boolean) {
  if (!isAvailable || status === "out_of_stock") {
    return "bg-red-50 text-red-800 ring-red-100";
  }
  if (status === "low_stock" || status === "preorder") {
    return "bg-amber-50 text-amber-900 ring-amber-100";
  }
  return "bg-emerald-50 text-emerald-800 ring-emerald-100";
}

function getPriceMovement(offer: MarketplaceOffer) {
  const history = offer.priceHistory;
  if (history.length < 2) return null;

  const difference = history[history.length - 1].price - history[0].price;
  if (difference === 0) {
    return { label: "Harga stabil", className: "text-slate-600" };
  }

  const formattedDifference = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.abs(difference));

  return difference < 0
    ? { label: `Turun ${formattedDifference}`, className: "text-emerald-800" }
    : { label: `Naik ${formattedDifference}`, className: "text-red-700" };
}

function getDiscountPercentage(offer: MarketplaceOffer) {
  if (
    !offer.originalPrice ||
    offer.originalPrice <= offer.price ||
    offer.originalPrice <= 0
  ) {
    return null;
  }

  return Math.round(
    ((offer.originalPrice - offer.price) / offer.originalPrice) * 100,
  );
}

export default function MarketplaceOffers({ offers }: MarketplaceOffersProps) {
  if (offers.length === 0) {
    return (
      <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200">
          <StoreIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-slate-950">
          Harga marketplace belum tersedia
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kami belum memiliki data harga terbaru untuk produk ini.
        </p>
      </section>
    );
  }

  const availableOffers = offers.filter(
    (offer) => offer.isAvailable && offer.stockStatus !== "out_of_stock",
  );
  const bestOffer = availableOffers[0] ?? null;

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
            Perbandingan harga
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Harga dari marketplace
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Penawaran diurutkan berdasarkan total harga produk dan ongkir.
          </p>
        </div>

        {bestOffer ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-emerald-800">
              Penawaran terbaik
            </p>
            <p className="mt-1 text-lg font-extrabold text-emerald-900">
              {bestOffer.marketplace}
            </p>
            <p className="text-sm font-bold text-emerald-800">
              {bestOffer.formattedTotalPrice}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-red-800">
              Ketersediaan
            </p>
            <p className="mt-1 text-sm font-extrabold text-red-800">
              Semua penawaran sedang tidak tersedia
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {offers.map((offer) => {
          const movement = getPriceMovement(offer);
          const discountPercentage = getDiscountPercentage(offer);
          const isBestOffer = bestOffer?.id === offer.id;
          const canOpenStore =
            Boolean(offer.affiliateUrl) &&
            offer.isAvailable &&
            offer.stockStatus !== "out_of_stock";

          return (
            <article
              key={offer.id}
              className={`public-card rounded-[1.5rem] border bg-white p-4 sm:p-5 ${
                isBestOffer
                  ? "border-emerald-300 ring-1 ring-emerald-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="min-w-0 lg:w-52">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-950">
                      {offer.marketplace}
                    </h3>
                    {isBestOffer && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-1.5 text-xs font-extrabold text-white">
                        <TagIcon className="h-3.5 w-3.5" /> Termurah
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold ring-1 ${getStockClass(
                      offer.stockStatus,
                      offer.isAvailable,
                    )}`}
                  >
                    {getStockLabel(offer.stockStatus, offer.isAvailable)}
                  </span>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Harga produk</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-950">
                        {offer.formattedPrice}
                      </p>
                      {discountPercentage !== null && (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-extrabold text-red-700">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>
                    {offer.formattedOriginalPrice &&
                      offer.originalPrice !== offer.price && (
                        <p className="mt-1 text-xs text-slate-500 line-through">
                          {offer.formattedOriginalPrice}
                        </p>
                      )}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Ongkir</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {offer.formattedShippingCost}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-3">
                    <p className="text-xs font-semibold text-orange-800">Total</p>
                    <p className="mt-1 text-sm font-extrabold text-orange-900">
                      {offer.formattedTotalPrice}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Riwayat harga</p>
                    <p className={`mt-1 text-sm font-bold ${movement?.className ?? "text-slate-600"}`}>
                      {movement?.label ?? "Data awal"}
                    </p>
                  </div>
                </div>

                <div className="lg:w-44">
                  {canOpenStore ? (
                    <a
                      href={offer.affiliateUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-extrabold text-white transition hover:bg-orange-800"
                    >
                      Buka toko <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="min-h-11 w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-400"
                    >
                      {!offer.isAvailable || offer.stockStatus === "out_of_stock"
                        ? "Stok tidak tersedia"
                        : "Link belum tersedia"}
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                <ClockIcon className="h-3.5 w-3.5" />
                Terakhir diperiksa: {formatCheckedAt(offer.lastCheckedAt)}
              </p>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Harga dan ketersediaan dapat berubah sewaktu-waktu. Periksa detail akhir di marketplace sebelum membeli.
      </p>
    </section>
  );
}
