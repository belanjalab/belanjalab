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
    return "bg-red-50 text-red-700";
  }

  if (status === "low_stock" || status === "preorder") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-green-50 text-green-700";
}

function getPriceMovement(offer: MarketplaceOffer) {
  const history = offer.priceHistory;
  if (history.length < 2) return null;

  const difference =
    history[history.length - 1].price - history[0].price;

  if (difference === 0) {
    return { label: "Harga stabil", className: "text-slate-500" };
  }

  const formattedDifference = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.abs(difference));

  return difference < 0
    ? {
        label: `Turun ${formattedDifference}`,
        className: "text-green-600",
      }
    : {
        label: `Naik ${formattedDifference}`,
        className: "text-red-600",
      };
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

export default function MarketplaceOffers({
  offers,
}: MarketplaceOffersProps) {
  if (offers.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <h2 className="text-base font-black">
          Harga marketplace belum tersedia
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kami belum memiliki data harga terbaru untuk produk ini.
        </p>
      </section>
    );
  }

  const availableOffers = offers.filter(
    (offer) =>
      offer.isAvailable && offer.stockStatus !== "out_of_stock",
  );
  const bestOffer = availableOffers[0] ?? null;

  return (
    <section>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Perbandingan Harga
          </p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">
            Harga dari marketplace
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Urutan berdasarkan total harga produk dan ongkir.
          </p>
        </div>

        {bestOffer ? (
          <div className="rounded-xl bg-green-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-green-700">
              Penawaran terbaik
            </p>
            <p className="mt-1 text-lg font-black text-green-700">
              {bestOffer.marketplace}
            </p>
            <p className="text-sm font-bold text-green-600">
              {bestOffer.formattedTotalPrice}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-red-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">
              Ketersediaan
            </p>
            <p className="mt-1 text-sm font-black text-red-700">
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
          const hasValidLink =
            Boolean(offer.affiliateUrl) && offer.affiliateUrl !== "#";
          const canOpenStore =
            hasValidLink &&
            offer.isAvailable &&
            offer.stockStatus !== "out_of_stock";

          return (
            <article
              key={offer.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm md:p-5 ${
                isBestOffer
                  ? "border-green-300 ring-1 ring-green-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="min-w-0 md:w-48">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black">
                      {offer.marketplace}
                    </h3>

                    {isBestOffer && (
                      <span className="rounded-full bg-green-500 px-2 py-1 text-[9px] font-bold text-white">
                        TERMURAH
                      </span>
                    )}
                  </div>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${getStockClass(
                      offer.stockStatus,
                      offer.isAvailable,
                    )}`}
                  >
                    {getStockLabel(
                      offer.stockStatus,
                      offer.isAvailable,
                    )}
                  </span>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-[10px] text-slate-400">
                      Harga produk
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-orange-500">
                        {offer.formattedPrice}
                      </p>

                      {discountPercentage !== null && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black text-red-600">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>

                    {offer.formattedOriginalPrice &&
                      offer.originalPrice !== offer.price && (
                        <p className="mt-1 text-[10px] text-slate-400 line-through">
                          {offer.formattedOriginalPrice}
                        </p>
                      )}
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">Ongkir</p>
                    <p className="mt-1 text-sm font-bold">
                      {offer.formattedShippingCost}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">Total</p>
                    <p className="mt-1 text-sm font-black">
                      {offer.formattedTotalPrice}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">
                      Riwayat harga
                    </p>
                    <p
                      className={`mt-1 text-sm font-bold ${
                        movement?.className ?? "text-slate-500"
                      }`}
                    >
                      {movement?.label ?? "Data awal"}
                    </p>
                  </div>
                </div>

                <div className="md:w-40">
                  {canOpenStore ? (
                    <a
                      href={offer.affiliateUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="block rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-orange-600"
                    >
                      Buka Toko
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400"
                    >
                      {!offer.isAvailable ||
                      offer.stockStatus === "out_of_stock"
                        ? "Stok tidak tersedia"
                        : "Link belum tersedia"}
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                Terakhir diperiksa: {formatCheckedAt(offer.lastCheckedAt)}
              </p>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-[10px] leading-5 text-slate-400">
        Harga dan ketersediaan dapat berubah sewaktu-waktu. Periksa kembali
        detail akhir di marketplace sebelum melakukan pembelian.
      </p>
    </section>
  );
}
