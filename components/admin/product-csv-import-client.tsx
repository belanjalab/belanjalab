"use client";

import { useMemo, useState, useTransition } from "react";

import {
  importProductsFromCsv,
  type ProductCsvImportResult,
  type ProductCsvImportRow,
} from "@/lib/admin-product-import";

const REQUIRED_HEADERS = ["name", "category", "brand"] as const;

const EXPECTED_HEADERS = [
  "name",
  "slug",
  "category",
  "brand",
  "short_description",
  "description",
  "image_url",
  "status",
  "performance",
  "design",
  "features",
  "value",
  "ease_of_use",
  "marketplace",
  "price",
  "affiliate_url",
] as const;

type CsvRow = Record<string, string>;

type ParsedCsv = {
  headers: string[];
  rows: CsvRow[];
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);

      if (currentRow.some((cell) => cell.trim() !== "")) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  currentRow.push(currentCell);

  if (currentRow.some((cell) => cell.trim() !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function validateScore(value: string) {
  if (!value.trim()) {
    return true;
  }

  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 10;
}

function validateHttpUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getRowErrors(row: CsvRow, index: number) {
  const errors: string[] = [];

  if (!row.name?.trim()) {
    errors.push(`Baris ${index}: name wajib diisi.`);
  }

  if (!row.category?.trim()) {
    errors.push(`Baris ${index}: category wajib diisi.`);
  }

  if (!row.brand?.trim()) {
    errors.push(`Baris ${index}: brand wajib diisi.`);
  }

  if (
    row.status &&
    !["draft", "published"].includes(row.status.trim().toLowerCase())
  ) {
    errors.push(`Baris ${index}: status harus draft atau published.`);
  }

  for (const field of [
    "performance",
    "design",
    "features",
    "value",
    "ease_of_use",
  ]) {
    if (!validateScore(row[field] ?? "")) {
      errors.push(`Baris ${index}: ${field} harus bernilai 0-10.`);
    }
  }

  if (row.price?.trim()) {
    const price = Number(row.price);

    if (!Number.isFinite(price) || price < 0) {
      errors.push(`Baris ${index}: price harus berupa angka positif.`);
    }
  }

  if (!validateHttpUrl(row.image_url ?? "")) {
    errors.push(`Baris ${index}: image_url tidak valid.`);
  }

  if (!validateHttpUrl(row.affiliate_url ?? "")) {
    errors.push(`Baris ${index}: affiliate_url tidak valid.`);
  }

  return errors;
}

export default function ProductCsvImportClient() {
  const [fileName, setFileName] = useState("");
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [fileError, setFileError] = useState("");
  const [importResults, setImportResults] = useState<
    ProductCsvImportResult[]
  >([]);
  const [isPending, startTransition] = useTransition();

  const validation = useMemo(() => {
    if (!parsedCsv) {
      return {
        errors: [] as string[],
        missingHeaders: [] as string[],
      };
    }

    const missingHeaders = REQUIRED_HEADERS.filter(
      (header) => !parsedCsv.headers.includes(header),
    );

    const errors = parsedCsv.rows.flatMap((row, index) =>
      getRowErrors(row, index + 2),
    );

    return {
      errors,
      missingHeaders,
    };
  }, [parsedCsv]);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    setParsedCsv(null);
    setFileError("");
    setImportResults([]);
    setFileName(file?.name ?? "");

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileError("File harus menggunakan format .csv.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError("Ukuran file maksimal 2 MB.");
      return;
    }

    const text = await file.text();
    const table = parseCsv(text);

    if (table.length < 2) {
      setFileError("CSV harus memiliki header dan minimal satu baris data.");
      return;
    }

    const headers = table[0].map(normalizeHeader);

    const duplicateHeaders = headers.filter(
      (header, index) => headers.indexOf(header) !== index,
    );

    if (duplicateHeaders.length > 0) {
      setFileError(
        `Header duplikat ditemukan: ${Array.from(
          new Set(duplicateHeaders),
        ).join(", ")}`,
      );
      return;
    }

    const unsupportedHeaders = headers.filter(
      (header) =>
        !EXPECTED_HEADERS.includes(
          header as (typeof EXPECTED_HEADERS)[number],
        ),
    );

    if (unsupportedHeaders.length > 0) {
      setFileError(
        `Header tidak dikenali: ${unsupportedHeaders.join(", ")}`,
      );
      return;
    }

    const rows = table.slice(1).map((cells) => {
      const row: CsvRow = {};

      headers.forEach((header, index) => {
        row[header] = (cells[index] ?? "").trim();
      });

      return row;
    });

    setParsedCsv({
      headers,
      rows,
    });
  }

  const isValid =
    parsedCsv &&
    validation.missingHeaders.length === 0 &&
    validation.errors.length === 0;


  function handleImport() {
    if (!parsedCsv || !isValid || isPending) {
      return;
    }

    const rows = parsedCsv.rows as ProductCsvImportRow[];

    startTransition(async () => {
      const response = await importProductsFromCsv(rows);
      setImportResults(response.results);
    });
  }

  const importedSuccessCount = importResults.filter(
    (result) => result.status === "success",
  ).length;
  const importedErrorCount = importResults.length - importedSuccessCount;

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-lg font-black text-slate-900">
          Upload CSV
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Gunakan CSV UTF-8 dengan header sesuai template BelanjaLab.
        </p>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="mt-5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-orange-600"
        />

        {fileName && (
          <p className="mt-3 text-xs font-semibold text-slate-500">
            File: {fileName}
          </p>
        )}

        {fileError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {fileError}
          </div>
        )}
      </div>

      {parsedCsv && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs text-slate-500">Total baris</p>
              <p className="mt-1 text-2xl font-black">
                {parsedCsv.rows.length}
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4">
              <p className="text-xs text-green-700">Baris valid</p>
              <p className="mt-1 text-2xl font-black text-green-700">
                {validation.errors.length === 0
                  ? parsedCsv.rows.length
                  : Math.max(
                      0,
                      parsedCsv.rows.length -
                        new Set(
                          validation.errors.map((error) =>
                            error.split(":")[0],
                          ),
                        ).size,
                    )}
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-xs text-red-700">Total error</p>
              <p className="mt-1 text-2xl font-black text-red-700">
                {validation.errors.length +
                  validation.missingHeaders.length}
              </p>
            </div>
          </div>

          {validation.missingHeaders.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Header wajib belum ada:{" "}
              {validation.missingHeaders.join(", ")}
            </div>
          )}

          {validation.errors.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-white p-5">
              <h2 className="text-sm font-black text-red-700">
                Hasil Validasi
              </h2>

              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto text-xs text-red-600">
                {validation.errors.map((error, index) => (
                  <p key={`${error}-${index}`}>{error}</p>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-black text-slate-900">
                Preview Data
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan maksimal 20 baris pertama.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-black">Baris</th>
                    {parsedCsv.headers.map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-4 py-3 font-black"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {parsedCsv.rows.slice(0, 20).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 font-bold text-slate-400">
                        {index + 2}
                      </td>

                      {parsedCsv.headers.map((header) => (
                        <td
                          key={header}
                          className="max-w-64 whitespace-nowrap px-4 py-3 text-slate-600"
                        >
                          <span className="block max-w-64 truncate">
                            {row[header] || "—"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {importResults.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Hasil Import
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {importedSuccessCount} berhasil · {importedErrorCount} gagal
                  </p>
                </div>

                <a
                  href="/admin"
                  className="rounded-xl bg-slate-950 px-4 py-3 text-center text-xs font-bold text-white hover:bg-slate-800"
                >
                  Lihat Daftar Produk
                </a>
              </div>

              <div className="mt-5 max-h-96 space-y-2 overflow-y-auto">
                {importResults.map((result) => (
                  <div
                    key={`${result.rowNumber}-${result.name}`}
                    className={`rounded-xl border px-4 py-3 text-xs ${
                      result.status === "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    <p className="font-black">
                      Baris {result.rowNumber}: {result.name}
                    </p>
                    <p className="mt-1">{result.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleImport}
              disabled={!isValid || isPending || importResults.length > 0}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Mengimport..." : "Import ke Supabase"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
