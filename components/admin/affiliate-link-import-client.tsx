"use client";

import { useEffect, useMemo, useState } from "react";

import { parseAffiliateLinks } from "@/lib/affiliate-import/parser";
import {
  MAX_AFFILIATE_LINKS,
  type AffiliateProductPreview,
} from "@/lib/affiliate-import/types";

const REQUEST_GAP_MS = 900;
const JSONP_TIMEOUT_MS = 55_000;
const RESOLVER_STORAGE_KEY = "belanjalab:shopee-image-resolver-url:v1";
const DEFAULT_RESOLVER_URL =
  process.env.NEXT_PUBLIC_SHOPEE_IMAGE_RESOLVER_URL?.trim() ?? "";

const BLOCKED_IMAGE_MARKERS = [
  "/assets/",
  "app_icon",
  "app-icon",
  "apple-touch-icon",
  "favicon",
  "ios_icon",
  "ios-icon",
  "mobilemall-live",
  "shopee-mobilemall",
  "shopee_logo",
  "shopee-logo",
];

type ResolverPayload = {
  success?: boolean;
  image_url?: unknown;
  imageUrl?: unknown;
  resolved_url?: unknown;
  resolvedUrl?: unknown;
  source?: unknown;
  message?: unknown;
  error?: unknown;
};

function isShopeeProductImageUrl(value: string) {
  if (!value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    const normalized = url.toString().toLowerCase();
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (BLOCKED_IMAGE_MARKERS.some((marker) => normalized.includes(marker))) {
      return false;
    }

    return (
      (hostname.endsWith("susercontent.com") && pathname.includes("/file/")) ||
      (hostname.endsWith("shopee.co.id") && pathname.includes("/file/")) ||
      (hostname.includes("img.shopee") && pathname.includes("/file/"))
    );
  } catch {
    return false;
  }
}

function normalizeResolverUrl(value: string) {
  const url = new URL(value.trim());
  const hostname = url.hostname.toLowerCase();

  if (url.protocol !== "https:") {
    throw new Error("URL resolver harus menggunakan HTTPS.");
  }

  const isAppsScriptUrl =
    hostname === "script.google.com" ||
    hostname.endsWith(".script.google.com");

  if (!isAppsScriptUrl) {
    throw new Error("Gunakan URL deployment dari script.google.com.");
  }

  if (!/^\/macros\/s\/[^/]+\/exec\/?$/i.test(url.pathname)) {
    throw new Error("URL Web App harus berakhiran /exec, bukan /dev.");
  }

  url.hash = "";
  url.search = "";
  return url.toString();
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createPreview(
  affiliateUrl: string,
  options: {
    imageUrl?: string;
    resolvedUrl?: string | null;
    message: string;
    warning?: string;
  },
): AffiliateProductPreview {
  const imageUrl = options.imageUrl?.trim() ?? "";
  const hasImage = isShopeeProductImageUrl(imageUrl);

  return {
    id: crypto.randomUUID(),
    marketplace: "shopee",
    affiliateUrl,
    resolvedUrl: options.resolvedUrl ?? null,
    status: hasImage ? "success" : "failed",
    errorCode: hasImage ? null : "metadata-not-found",
    message: options.message,
    warnings: options.warning ? [options.warning] : [],
    name: "",
    description: "",
    imageUrl: hasImage ? imageUrl : "",
    price: null,
    priceMax: null,
    currency: null,
    shopId: null,
    itemId: null,
    fetchedAt: new Date().toISOString(),
  };
}

function requestImageFromAppsScript(
  resolverUrl: string,
  affiliateUrl: string,
): Promise<AffiliateProductPreview> {
  return new Promise((resolve, reject) => {
    const callbackName = `__belanjalabShopeeImage_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const callbackRegistry = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      script.remove();
      delete callbackRegistry[callbackName];
    };

    const finish = (
      result:
        | { type: "resolve"; value: AffiliateProductPreview }
        | { type: "reject"; value: Error },
    ) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();

      if (result.type === "resolve") {
        resolve(result.value);
      } else {
        reject(result.value);
      }
    };

    const timeoutId = window.setTimeout(() => {
      finish({
        type: "reject",
        value: new Error(
          "Resolver Google Apps Script melewati batas waktu. Coba ulang link ini.",
        ),
      });
    }, JSONP_TIMEOUT_MS);

    callbackRegistry[callbackName] = (rawPayload: unknown) => {
      const payload =
        rawPayload && typeof rawPayload === "object"
          ? (rawPayload as ResolverPayload)
          : {};
      const imageUrl = getString(payload.image_url ?? payload.imageUrl);
      const resolvedUrl =
        getString(payload.resolved_url ?? payload.resolvedUrl) || null;
      const payloadMessage = getString(payload.message ?? payload.error);
      const source = getString(payload.source);
      const hasImage = isShopeeProductImageUrl(imageUrl);

      finish({
        type: "resolve",
        value: createPreview(affiliateUrl, {
          imageUrl,
          resolvedUrl,
          message: hasImage
            ? "Link gambar produk berhasil ditemukan."
            : payloadMessage || "Gambar produk tidak ditemukan oleh resolver.",
          warning: source ? `Sumber resolver: ${source}.` : undefined,
        }),
      });
    };

    let endpoint: URL;

    try {
      endpoint = new URL(resolverUrl);
      endpoint.searchParams.set("url", affiliateUrl);
      endpoint.searchParams.set("callback", callbackName);
      endpoint.searchParams.set("_", String(Date.now()));
    } catch {
      finish({
        type: "reject",
        value: new Error("URL resolver Google Apps Script tidak valid."),
      });
      return;
    }

    script.async = true;
    script.src = endpoint.toString();
    script.onerror = () => {
      finish({
        type: "reject",
        value: new Error(
          "Resolver Google Apps Script tidak dapat diakses. Pastikan deployment menggunakan akses Anyone.",
        ),
      });
    };

    document.head.appendChild(script);
  });
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadImageCsv(items: AffiliateProductPreview[]) {
  const imageUrls = items
    .map((item) => item.imageUrl.trim())
    .filter(isShopeeProductImageUrl);

  const content = `\uFEFFimage_url\r\n${imageUrls
    .map(escapeCsvCell)
    .join("\r\n")}`;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);

  anchor.href = objectUrl;
  anchor.download = `shopee-image-links-${dateStamp}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function ImagePreview({ item }: { item: AffiliateProductPreview }) {
  const [previewFailed, setPreviewFailed] = useState(false);

  if (!isShopeeProductImageUrl(item.imageUrl) || previewFailed) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 px-2 text-center text-xs font-semibold text-slate-400">
        Tidak ada preview
      </div>
    );
  }

  return (
    <img
      src={item.imageUrl}
      alt="Preview gambar produk Shopee"
      referrerPolicy="no-referrer"
      onError={() => setPreviewFailed(true)}
      className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
    />
  );
}

export default function AffiliateLinkImportClient() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<AffiliateProductPreview[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [resolverUrl, setResolverUrl] = useState("");
  const [resolverDraft, setResolverDraft] = useState("");
  const [resolverMessage, setResolverMessage] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const storedUrl = window.localStorage.getItem(RESOLVER_STORAGE_KEY) ?? "";
    const initialUrl = storedUrl || DEFAULT_RESOLVER_URL;

    if (initialUrl) {
      try {
        const normalized = normalizeResolverUrl(initialUrl);
        setResolverUrl(normalized);
        setResolverDraft(normalized);
      } catch {
        setResolverDraft(initialUrl);
      }
    }

    setSettingsLoaded(true);
  }, []);

  const successfulItems = useMemo(
    () => items.filter((item) => isShopeeProductImageUrl(item.imageUrl)),
    [items],
  );

  function handleSaveResolver() {
    try {
      const normalized = normalizeResolverUrl(resolverDraft);
      window.localStorage.setItem(RESOLVER_STORAGE_KEY, normalized);
      setResolverUrl(normalized);
      setResolverDraft(normalized);
      setResolverMessage("Resolver tersimpan di browser ini.");
      setMessage("");
    } catch (error) {
      setResolverMessage(
        error instanceof Error
          ? error.message
          : "URL resolver Google Apps Script tidak valid.",
      );
    }
  }

  function handleClearResolver() {
    window.localStorage.removeItem(RESOLVER_STORAGE_KEY);
    setResolverUrl("");
    setResolverDraft("");
    setResolverMessage("Resolver dihapus dari browser ini.");
  }

  async function handleScan() {
    const parsed = parseAffiliateLinks(input);

    if (!resolverUrl) {
      setMessage(
        "Simpan URL Web App Google Apps Script terlebih dahulu sebelum memindai.",
      );
      return;
    }

    if (parsed.validLinks.length === 0) {
      setMessage("Masukkan minimal satu link Shopee yang valid.");
      setItems([]);
      return;
    }

    setIsScanning(true);
    setItems([]);
    setMessage("");
    setCopyMessage("");
    setProgress({ completed: 0, total: parsed.validLinks.length });

    const results: AffiliateProductPreview[] = [];

    try {
      for (const [index, link] of parsed.validLinks.entries()) {
        let item: AffiliateProductPreview;

        try {
          item = await requestImageFromAppsScript(resolverUrl, link);
        } catch (error) {
          item = createPreview(link, {
            message:
              error instanceof Error
                ? error.message
                : "Resolver gagal mengambil link gambar.",
          });
        }

        results.push(item);
        setItems([...results]);
        setProgress({
          completed: results.length,
          total: parsed.validLinks.length,
        });

        if (index < parsed.validLinks.length - 1) {
          await wait(REQUEST_GAP_MS);
        }
      }

      const foundCount = results.filter((item) =>
        isShopeeProductImageUrl(item.imageUrl),
      ).length;
      const invalidCount = parsed.summary.invalidCount;
      const duplicateCount = parsed.summary.duplicateCount;
      const notes = [
        `${foundCount} link gambar ditemukan dari ${parsed.validLinks.length} link valid.`,
      ];

      if (duplicateCount > 0) {
        notes.push(`${duplicateCount} link duplikat dilewati.`);
      }

      if (invalidCount > 0) {
        notes.push(`${invalidCount} link tidak valid dilewati.`);
      }

      setMessage(notes.join(" "));
    } finally {
      setIsScanning(false);
    }
  }

  function handleClear() {
    setInput("");
    setItems([]);
    setMessage("");
    setCopyMessage("");
    setProgress({ completed: 0, total: 0 });
  }

  async function handleCopy(imageUrl: string) {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopyMessage("Link gambar berhasil disalin.");
    } catch {
      setCopyMessage("Browser tidak mengizinkan salin otomatis.");
    }
  }

  async function handleCopyAll() {
    if (successfulItems.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        successfulItems.map((item) => item.imageUrl.trim()).join("\n"),
      );
      setCopyMessage(
        `${successfulItems.length} link gambar berhasil disalin.`,
      );
    } catch {
      setCopyMessage("Browser tidak mengizinkan salin otomatis.");
    }
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
        <p className="font-black">Ambil link gambar Shopee</p>
        <p className="mt-1 text-xs leading-5">
          Pemrosesan Shopee dilakukan oleh Google Apps Script dari browser.
          Cloudflare Worker tidak lagi membuka halaman Shopee, sehingga tidak
          terkena Error 1102.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Resolver Google Apps Script
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Tempel URL deployment Web App yang berakhiran /exec. URL hanya
              disimpan di browser ini.
            </p>
          </div>
          <span
            className={`w-fit rounded-lg border px-3 py-2 text-xs font-bold ${
              resolverUrl
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {resolverUrl ? "Resolver aktif" : "Belum dikonfigurasi"}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2 lg:flex-row">
          <input
            type="url"
            value={resolverDraft}
            onChange={(event) => {
              setResolverDraft(event.target.value);
              setResolverMessage("");
            }}
            spellCheck={false}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={handleSaveResolver}
            disabled={!settingsLoaded || !resolverDraft.trim() || isScanning}
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Simpan Resolver
          </button>
          <button
            type="button"
            onClick={handleClearResolver}
            disabled={!settingsLoaded || !resolverUrl || isScanning}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hapus
          </button>
        </div>

        {resolverMessage && (
          <p className="mt-3 text-xs font-semibold text-slate-600">
            {resolverMessage}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Link produk Shopee
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Bisa satu link atau banyak link. Gunakan satu link per baris.
            </p>
          </div>
          <span className="w-fit rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
            Maksimal {MAX_AFFILIATE_LINKS} link
          </span>
        </div>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setMessage("");
            setCopyMessage("");
          }}
          rows={9}
          spellCheck={false}
          placeholder={[
            "https://s.shopee.co.id/xxxxxxxx",
            "https://shopee.co.id/nama-produk-i.123456.789012",
          ].join("\n")}
          className="mt-5 block w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClear}
            disabled={isScanning || (!input && items.length === 0)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Bersihkan
          </button>
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning || !input.trim() || !resolverUrl}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScanning
              ? `Mengambil ${progress.completed}/${progress.total}`
              : "Ambil Link Gambar"}
          </button>
        </div>

        {isScanning && progress.total > 0 && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${Math.round(
                  (progress.completed / progress.total) * 100,
                )}%`,
              }}
            />
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {message}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Hasil link gambar
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {successfulItems.length} dari {items.length} gambar berhasil
                ditemukan.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyAll}
                disabled={successfulItems.length === 0}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Salin Semua Link
              </button>
              <button
                type="button"
                onClick={() => downloadImageCsv(successfulItems)}
                disabled={successfulItems.length === 0}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export CSV ({successfulItems.length})
              </button>
            </div>
          </div>

          {copyMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
              {copyMessage}
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, index) => {
              const hasProductImage = isShopeeProductImageUrl(item.imageUrl);

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <ImagePreview item={item} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Produk {index + 1}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-black ${
                            hasProductImage
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {hasProductImage ? "Berhasil" : "Gagal"}
                        </span>
                      </div>

                      {hasProductImage ? (
                        <input
                          readOnly
                          value={item.imageUrl}
                          onFocus={(event) => event.currentTarget.select()}
                          className="mt-3 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700 outline-none"
                        />
                      ) : (
                        <p className="mt-3 text-sm font-semibold text-red-700">
                          {item.message}
                        </p>
                      )}

                      <p className="mt-2 break-all text-xs text-slate-400">
                        Sumber: {item.affiliateUrl}
                      </p>
                    </div>

                    {hasProductImage && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.imageUrl)}
                        className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Salin Link
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
