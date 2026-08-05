"use client";

import { useState } from "react";

import { parseAffiliateLinks } from "@/lib/affiliate-import/parser";
import {
  MAX_AFFILIATE_LINKS,
  type AffiliateLinkParseResult,
  type ParsedAffiliateLink,
} from "@/lib/affiliate-import/types";

const STATUS_STYLES: Record<ParsedAffiliateLink["status"], string> = {
  valid: "border-green-200 bg-green-50 text-green-700",
  duplicate: "border-amber-200 bg-amber-50 text-amber-700",
  invalid: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<ParsedAffiliateLink["status"], string> = {
  valid: "Valid",
  duplicate: "Duplikat",
  invalid: "Tidak valid",
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

export default function AffiliateLinkImportClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AffiliateLinkParseResult | null>(null);
  const [formError, setFormError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
    setResult(null);
    setFormError("");
    setCopyMessage("");
  }

  function handleValidate() {
    if (!input.trim()) {
      setResult(null);
      setFormError("Masukkan minimal satu link Shopee.");
      return;
    }

    const nextResult = parseAffiliateLinks(input);

    setResult(nextResult);
    setFormError("");
    setCopyMessage("");
  }

  function handleReset() {
    setInput("");
    setResult(null);
    setFormError("");
    setCopyMessage("");
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

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Paste Link Shopee
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Satu link per baris paling mudah dibaca. Teks tambahan di sekitar
              URL tetap akan dipindai secara otomatis.
            </p>
          </div>

          <div className="w-fit rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
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
          className="mt-5 block w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Link duplikat tidak akan ikut ke proses berikutnya.
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
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Validasi & Preview
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
                              className="block max-w-xl break-all font-semibold text-slate-700 hover:text-orange-600"
                            >
                              {row.normalizedUrl}
                            </a>
                          ) : (
                            <span className="block max-w-xl break-all text-slate-500">
                              {row.rawValue}
                            </span>
                          )}
                          <p className="mt-1 text-[11px] text-slate-400">
                            {row.hostname ?? "Domain tidak terbaca"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-600">
                          {getLinkKindLabel(row)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 font-black ${STATUS_STYLES[row.status]}`}
                          >
                            {STATUS_LABELS[row.status]}
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
            <p className="text-sm font-black text-blue-900">
              Tahap validasi selesai
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              {result.summary.readyCount > 0
                ? `${result.summary.readyCount} link unik siap diteruskan ke tahap pengambilan nama, gambar, dan harga produk.`
                : "Belum ada link valid yang bisa diteruskan ke tahap pengambilan data produk."}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
