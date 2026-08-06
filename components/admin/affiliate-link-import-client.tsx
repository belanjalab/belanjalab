"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { parseAffiliateLinks } from "@/lib/affiliate-import/parser";
import {
  AFFILIATE_SCAN_CLIENT_BATCH_SIZE,
  MAX_AFFILIATE_LINKS,
  type AffiliateLinkParseResult,
  type AffiliateProductPreview,
  type AffiliateProductScanErrorResponse,
  type AffiliateProductScanResponse,
  type ParsedAffiliateLink,
} from "@/lib/affiliate-import/types";

const LINK_STATUS_STYLES: Record<ParsedAffiliateLink["status"], string> = {
  valid: "border-green-200 bg-green-50 text-green-700",
  duplicate: "border-amber-200 bg-amber-50 text-amber-700",
  invalid: "border-red-200 bg-red-50 text-red-700",
};

const LINK_STATUS_LABELS: Record<ParsedAffiliateLink["status"], string> = {
  valid: "Valid",
  duplicate: "Duplikat",
  invalid: "Tidak valid",
};

const PRODUCT_STATUS_STYLES: Record<AffiliateProductPreview["status"], string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

const PRODUCT_STATUS_LABELS: Record<AffiliateProductPreview["status"], string> = {
  success: "Lengkap",
  partial: "Perlu dilengkapi",
  failed: "Gagal",
};

type AffiliateLinkImportClientProps = {
  openApiConfigured: boolean;
};

function getLinkKindLabel(row: ParsedAffiliateLink) {
  if (row.kind === "affiliate-shortlink") {
    return "Short link affiliate";
  }

  if (row.kind === "direct-shopee-link") {
    return "Link Shopee langsung";
  }

  return "—";
}

function formatRupiah(value: number | null) {
  if (value === null) {
    return "Belum tersedia";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function chunkLinks(links: string[]) {
  const chunks: string[][] = [];

  for (let index = 0; index < links.length; index += AFFILIATE_SCAN_CLIENT_BATCH_SIZE) {
    chunks.push(links.slice(index, index + AFFILIATE_SCAN_CLIENT_BATCH_SIZE));
  }

  return chunks;
}

function isProductReady(item: AffiliateProductPreview) {
  return Boolean(
    item.name.trim() &&
      item.imageUrl.trim() &&
      item.price !== null &&
      item.price > 0,
  );
}

function canAutoScan(result: AffiliateLinkParseResult) {
  return (
    result.rows.length === 1 &&
    result.summary.readyCount === 1 &&
    result.summary.invalidCount === 0 &&
    result.summary.duplicateCount === 0
  );
}

function ProductImagePreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-44 items-center justify-center bg-slate-100 px-4 text-center text-xs font-semibold text-slate-400">
        Gambar belum tersedia
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Preview produk Shopee"}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-44 w-full bg-white object-contain p-3"
    />
  );
}

async function requestProductScan(links: string[]) {
  const response = await fetch("/api/admin/affiliate/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({ links }),
  });

  const payload = (await response.json()) as
    | AffiliateProductScanResponse
    | AffiliateProductScanErrorResponse;

  if (!response.ok || !("items" in payload)) {
    throw new Error(
      "error" in payload
        ? payload.error
        : "Gagal mengambil data produk dari server.",
    );
  }

  return payload;
}

export default function AffiliateLinkImportClient({
  openApiConfigured,
}: AffiliateLinkImportClientProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AffiliateLinkParseResult | null>(null);
  const [formError, setFormError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [scanItems, setScanItems] = useState<AffiliateProductPreview[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanProgress, setScanProgress] = useState({ completed: 0, total: 0 });
  const [retryingIds, setRetryingIds] = useState<string[]>([]);
  const scanSequenceRef = useRef(0);
  const lastAutoScannedUrlRef = useRef("");

  const scanSummary = useMemo(() => {
    return {
      total: scanItems.length,
      success: scanItems.filter((item) => item.status === "success").length,
      partial: scanItems.filter((item) => item.status === "partial").length,
      failed: scanItems.filter((item) => item.status === "failed").length,
      ready: scanItems.filter(isProductReady).length,
    };
  }, [scanItems]);

  const scanProducts = useCallback(async (validLinks: string[]) => {
    if (validLinks.length === 0) {
      return;
    }

    const scanSequence = scanSequenceRef.current + 1;
    scanSequenceRef.current = scanSequence;
    const batches = chunkLinks(validLinks);

    setIsScanning(true);
    setScanItems([]);
    setScanError("");
    setScanProgress({ completed: 0, total: validLinks.length });

    try {
      let completedCount = 0;

      for (const batch of batches) {
        const response = await requestProductScan(batch);

        if (scanSequenceRef.current !== scanSequence) {
          return;
        }

        completedCount += response.items.length;
        setScanItems((currentItems) => [
          ...currentItems,
          ...response.items,
        ]);
        setScanProgress({
          completed: completedCount,
          total: validLinks.length,
        });
      }
    } catch (error) {
      if (scanSequenceRef.current !== scanSequence) {
        return;
      }

      setScanError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data produk Shopee.",
      );
    } finally {
      if (scanSequenceRef.current === scanSequence) {
        setIsScanning(false);
      }
    }
  }, []);

  useEffect(() => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextResult = parseAffiliateLinks(trimmedInput);
      setResult(nextResult);
      setFormError("");

      if (!canAutoScan(nextResult)) {
        return;
      }

      const validUrl = nextResult.validLinks[0];

      if (!validUrl || lastAutoScannedUrlRef.current === validUrl) {
        return;
      }

      lastAutoScannedUrlRef.current = validUrl;
      void scanProducts(nextResult.validLinks);
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [input, scanProducts]);

  function clearScanState() {
    scanSequenceRef.current += 1;
    setIsScanning(false);
    setScanItems([]);
    setScanError("");
    setScanProgress({ completed: 0, total: 0 });
    setRetryingIds([]);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const nextInput = event.target.value;

    setInput(nextInput);
    setResult(null);
    setFormError("");
    setCopyMessage("");
    lastAutoScannedUrlRef.current = "";
    clearScanState();
  }

  function handleValidate() {
    if (!input.trim()) {
      setResult(null);
      setFormError("Masukkan minimal satu link Shopee.");
      clearScanState();
      return;
    }

    const nextResult = parseAffiliateLinks(input);

    setResult(nextResult);
    setFormError("");
    setCopyMessage("");
    clearScanState();

    if (canAutoScan(nextResult)) {
      const validUrl = nextResult.validLinks[0];

      if (validUrl) {
        lastAutoScannedUrlRef.current = validUrl;
        void scanProducts(nextResult.validLinks);
      }
    }
  }

  function handleReset() {
    setInput("");
    setResult(null);
    setFormError("");
    setCopyMessage("");
    lastAutoScannedUrlRef.current = "";
    clearScanState();
  }

  async function handleCopyValidLinks() {
    if (!result || result.validLinks.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.validLinks.join("\n"));
      setCopyMessage(`${result.validLinks.length} link valid berhasil disalin.`);
    } catch {
      setCopyMessage(
        "Browser tidak mengizinkan penyalinan otomatis. Salin link dari tabel secara manual.",
      );
    }
  }

  async function handleScanProducts() {
    if (!result || result.validLinks.length === 0 || isScanning) {
      return;
    }

    await scanProducts(result.validLinks);
  }

  async function handleRetryItem(item: AffiliateProductPreview) {
    if (retryingIds.includes(item.id)) {
      return;
    }

    setRetryingIds((currentIds) => [...currentIds, item.id]);
    setScanError("");

    try {
      const response = await requestProductScan([item.affiliateUrl]);
      const replacement = response.items[0];

      if (!replacement) {
        throw new Error("Server tidak mengembalikan hasil scan.");
      }

      setScanItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id ? replacement : currentItem,
        ),
      );
    } catch (error) {
      setScanError(
        error instanceof Error
          ? error.message
          : "Gagal mengulang pengambilan data.",
      );
    } finally {
      setRetryingIds((currentIds) =>
        currentIds.filter((id) => id !== item.id),
      );
    }
  }

  function updateTextField(
    id: string,
    field: "name" | "description" | "imageUrl",
    value: string,
  ) {
    setScanItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  function updatePriceField(
    id: string,
    field: "price" | "priceMax",
    value: string,
  ) {
    const digitsOnly = value.replace(/\D/g, "");
    const numericValue = digitsOnly ? Number(digitsOnly) : null;

    setScanItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, [field]: numericValue } : item,
      ),
    );
  }

  return (
    <section className="mt-8 space-y-6">
      <div
        className={`rounded-2xl border px-5 py-4 text-sm leading-6 ${
          openApiConfigured
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <p className="font-black">
          {openApiConfigured
            ? "Shopee Affiliate Open API aktif"
            : "Shopee Affiliate Open API belum aktif"}
        </p>
        <p className="mt-1 text-xs leading-5">
          {openApiConfigured
            ? "Nama, gambar, dan harga akan diprioritaskan dari API resmi Shopee Affiliate."
            : "Tanpa Open API, pengambilan dari halaman publik Shopee hanya best effort dan dapat dibatasi. Tambahkan SHOPEE_AFFILIATE_APP_ID dan SHOPEE_AFFILIATE_APP_SECRET pada runtime variables Cloudflare."}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Paste Link Shopee
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Tempel satu link untuk menampilkan foto, nama, dan harga secara
              otomatis. Untuk banyak link, gunakan satu link per baris.
            </p>
          </div>

          <div className="w-fit rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
            Maksimal {MAX_AFFILIATE_LINKS} link
          </div>
        </div>

        <textarea
          value={input}
          onChange={handleInputChange}
          rows={11}
          spellCheck={false}
          placeholder={[
            "https://shope.ee/xxxxxxxx",
            "https://s.shopee.co.id/xxxxxxxx",
            "https://shopee.co.id/nama-produk-i.123456.789012",
          ].join("\n")}
          className="mt-5 block w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Satu link dipindai otomatis setelah ditempel. Link duplikat tidak ikut diproses.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              disabled={!input && !result}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Bersihkan
            </button>
            <button
              type="button"
              onClick={handleValidate}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Validasi Ulang
            </button>
          </div>
        </div>

        {formError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {formError}
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs text-slate-500">Kandidat ditemukan</p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {result.summary.totalCandidates}
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4">
              <p className="text-xs text-green-700">Siap diproses</p>
              <p className="mt-1 text-2xl font-black text-green-700">
                {result.summary.readyCount}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-xs text-amber-700">Duplikat</p>
              <p className="mt-1 text-2xl font-black text-amber-700">
                {result.summary.duplicateCount}
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-xs text-red-700">Tidak valid</p>
              <p className="mt-1 text-2xl font-black text-red-700">
                {result.summary.invalidCount}
              </p>
            </div>
          </div>

          {result.summary.limitExceeded && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Jumlah link melebihi batas {MAX_AFFILIATE_LINKS}. Link setelah
              batas tersebut ditandai tidak valid.
            </div>
          )}

          {result.summary.directLinkCount > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="font-black">
                {result.summary.directLinkCount} link Shopee langsung ditemukan.
              </span>{" "}
              Link tetap bisa dipakai untuk mengambil data produk, tetapi
              tracking affiliate-nya belum dapat diverifikasi dari format URL.
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Preview Link
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {result.summary.affiliateShortlinkCount} short link affiliate ·{" "}
                  {result.summary.directLinkCount} link langsung
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyValidLinks}
                disabled={result.validLinks.length === 0}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Salin Link Valid
              </button>
            </div>

            {copyMessage && (
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600">
                {copyMessage}
              </div>
            )}

            {result.rows.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Tidak ada link yang ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-black">Baris</th>
                      <th className="px-4 py-3 font-black">Link</th>
                      <th className="px-4 py-3 font-black">Jenis</th>
                      <th className="px-4 py-3 font-black">Status</th>
                      <th className="px-4 py-3 font-black">Keterangan</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {result.rows.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-400">
                          {row.lineNumber}
                        </td>
                        <td className="min-w-80 px-4 py-4">
                          {row.normalizedUrl && row.status !== "invalid" ? (
                            <a
                              href={row.normalizedUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="block max-w-xl break-all font-semibold text-slate-700 hover:text-amber-800"
                            >
                              {row.normalizedUrl}
                            </a>
                          ) : (
                            <span className="block max-w-xl break-all text-slate-500">
                              {row.rawValue}
                            </span>
                          )}
                          <p className="mt-1 text-xs text-slate-400">
                            {row.hostname ?? "Domain tidak terbaca"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-600">
                          {getLinkKindLabel(row)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 font-black ${LINK_STATUS_STYLES[row.status]}`}
                          >
                            {LINK_STATUS_LABELS[row.status]}
                          </span>
                        </td>
                        <td className="min-w-64 px-4 py-4 leading-5 text-slate-600">
                          {row.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-blue-900">
                  Ambil metadata produk
                </p>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-blue-800">
                  Sistem akan membuka link di server, mengikuti redirect Shopee,
                  lalu membaca nama, gambar, harga, dan deskripsi yang tersedia.
                </p>
              </div>

              <button
                type="button"
                onClick={handleScanProducts}
                disabled={result.summary.readyCount === 0 || isScanning}
                className="shrink-0 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isScanning
                  ? `Mengambil ${scanProgress.completed}/${scanProgress.total}`
                  : `Ambil Data ${result.summary.readyCount} Produk`}
              </button>
            </div>

            {isScanning && scanProgress.total > 0 && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.round(
                      (scanProgress.completed / scanProgress.total) * 100,
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {scanError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {scanError}
        </div>
      )}

      {scanItems.length > 0 && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs text-slate-500">Sudah dipindai</p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {scanSummary.total}
              </p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4">
              <p className="text-xs text-green-700">Lengkap otomatis</p>
              <p className="mt-1 text-2xl font-black text-green-700">
                {scanSummary.success}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-xs text-amber-700">Sebagian</p>
              <p className="mt-1 text-2xl font-black text-amber-700">
                {scanSummary.partial}
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-xs text-red-700">Gagal</p>
              <p className="mt-1 text-2xl font-black text-red-700">
                {scanSummary.failed}
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
              <p className="text-xs text-blue-700">Siap disimpan</p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {scanSummary.ready}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Hasil Pengambilan Data
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Periksa dan koreksi data sebelum nanti disimpan sebagai draft
              produk. Harga marketplace dapat berubah sewaktu-waktu.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {scanItems.map((item, index) => {
              const retrying = retryingIds.includes(item.id);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid md:grid-cols-[190px_minmax(0,1fr)]">
                    <div className="border-b border-slate-200 bg-slate-50 md:border-b-0 md:border-r">
                      <ProductImagePreview
                        key={item.imageUrl}
                        src={item.imageUrl}
                        alt={item.name}
                      />
                      <div className="border-t border-slate-200 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Produk {index + 1}
                        </p>
                        <p className="mt-1 text-xs font-black text-slate-700">
                          {formatRupiah(item.price)}
                          {item.priceMax !== null
                            ? ` – ${formatRupiah(item.priceMax)}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${PRODUCT_STATUS_STYLES[item.status]}`}
                          >
                            {PRODUCT_STATUS_LABELS[item.status]}
                          </span>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {item.message}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRetryItem(item)}
                          disabled={retrying || isScanning}
                          className="inline-flex min-h-11 items-center justify-center shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {retrying ? "Mengulang..." : "Coba Ulang"}
                        </button>
                      </div>

                      <div className="mt-5 space-y-4">
                        <label className="block">
                          <span className="text-xs font-black text-slate-700">
                            Nama produk
                          </span>
                          <input
                            value={item.name}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateTextField(item.id, "name", event.target.value)
                            }
                            className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                          />
                        </label>

                        <label className="block">
                          <span className="text-xs font-black text-slate-700">
                            URL gambar
                          </span>
                          <input
                            value={item.imageUrl}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateTextField(
                                item.id,
                                "imageUrl",
                                event.target.value,
                              )
                            }
                            placeholder="https://..."
                            className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                          />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-black text-slate-700">
                              Harga terendah
                            </span>
                            <input
                              inputMode="numeric"
                              value={item.price ?? ""}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                updatePriceField(
                                  item.id,
                                  "price",
                                  event.target.value,
                                )
                              }
                              placeholder="0"
                              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-black text-slate-700">
                              Harga tertinggi
                            </span>
                            <input
                              inputMode="numeric"
                              value={item.priceMax ?? ""}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                updatePriceField(
                                  item.id,
                                  "priceMax",
                                  event.target.value,
                                )
                              }
                              placeholder="Opsional"
                              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                          </label>
                        </div>

                        <label className="block">
                          <span className="text-xs font-black text-slate-700">
                            Deskripsi dari marketplace
                          </span>
                          <textarea
                            value={item.description}
                            onChange={(
                              event: React.ChangeEvent<HTMLTextAreaElement>,
                            ) =>
                              updateTextField(
                                item.id,
                                "description",
                                event.target.value,
                              )
                            }
                            rows={3}
                            className="mt-1 block w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs leading-5 text-slate-700 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                          />
                        </label>
                      </div>

                      {item.warnings.length > 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800">
                          {item.warnings.map((warning) => (
                            <p key={warning}>{warning}</p>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-xs text-slate-400">
                        <a
                          href={item.affiliateUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="block break-all font-semibold hover:text-amber-800"
                        >
                          Affiliate: {item.affiliateUrl}
                        </a>
                        {item.resolvedUrl && (
                          <a
                            href={item.resolvedUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="block break-all font-semibold hover:text-amber-800"
                          >
                            Produk: {item.resolvedUrl}
                          </a>
                        )}
                        {(item.shopId || item.itemId) && (
                          <p>
                            Shop ID: {item.shopId ?? "—"} · Item ID:{" "}
                            {item.itemId ?? "—"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-900">
              Tahap pengambilan data selesai
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {scanSummary.ready} dari {scanSummary.total} produk sudah memiliki
              nama, gambar, dan harga. Tahap berikutnya adalah memilih kategori
              dan brand lalu menyimpan semuanya sebagai draft ke database.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
