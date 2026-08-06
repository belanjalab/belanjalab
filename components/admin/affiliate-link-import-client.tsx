"use client";

import { useMemo, useState } from "react";

import { parseAffiliateLinks } from "@/lib/affiliate-import/parser";
import {
  MAX_AFFILIATE_LINKS,
  type AffiliateProductPreview,
  type AffiliateProductScanErrorResponse,
  type AffiliateProductScanResponse,
} from "@/lib/affiliate-import/types";

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadImageCsv(items: AffiliateProductPreview[]) {
  const imageUrls = items
    .map((item) => item.imageUrl.trim())
    .filter(Boolean);

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

async function requestImageScan(link: string) {
  const response = await fetch("/api/admin/affiliate/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({ links: [link] }),
  });

  const payload = (await response.json()) as
    | AffiliateProductScanResponse
    | AffiliateProductScanErrorResponse;

  if (!response.ok || !("items" in payload)) {
    throw new Error(
      "error" in payload ? payload.error : "Link gambar gagal diambil.",
    );
  }

  const item = payload.items[0];

  if (!item) {
    throw new Error("Server tidak mengembalikan hasil.");
  }

  return item;
}

function ImagePreview({ item }: { item: AffiliateProductPreview }) {
  const [previewFailed, setPreviewFailed] = useState(false);

  if (!item.imageUrl || previewFailed) {
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

  const successfulItems = useMemo(
    () => items.filter((item) => Boolean(item.imageUrl.trim())),
    [items],
  );

  async function handleScan() {
    const parsed = parseAffiliateLinks(input);

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
      // Tetap satu link per request agar ringan untuk Cloudflare Worker.
      for (const link of parsed.validLinks) {
        const item = await requestImageScan(link);

        results.push(item);
        setItems([...results]);
        setProgress({
          completed: results.length,
          total: parsed.validLinks.length,
        });
      }

      const foundCount = results.filter((item) => item.imageUrl.trim()).length;
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
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil link gambar.",
      );
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
          Tempel link Shopee, lalu sistem hanya mengambil URL gambar utama.
          Harga, nama, deskripsi, dan data produk lain tidak diproses.
        </p>
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
            disabled={isScanning || !input.trim()}
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
            {items.map((item, index) => (
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
                          item.imageUrl
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {item.imageUrl ? "Berhasil" : "Gagal"}
                      </span>
                    </div>

                    {item.imageUrl ? (
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

                  {item.imageUrl && (
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
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
