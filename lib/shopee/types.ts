import { z } from "zod";

// 1. Skema Baris CSV
export const shopeeCsvRowSchema = z.object({
  name: z.string(),
  price: z.string(),
  affiliateUrl: z.string().url("URL Afiliasi tidak valid"),
  productUrl: z.string().url("URL Produk tidak valid"),
});

export type ShopeeCsvRow = z.infer<typeof shopeeCsvRowSchema>;

// ---------------------------------------------------------

// 2. Skema Status Scan
export const shopeeScanStatusSchema = z.enum([
  "ready_to_scan",
  "scanning",
  "success",
  "failed",
]);

export type ShopeeScanStatus = z.infer<typeof shopeeScanStatusSchema>;

// ---------------------------------------------------------

// 3. Skema Hasil Scan (Otomatis mewarisi properti dari CsvRowSchema menggunakan .extend)
export const shopeeScanResultSchema = shopeeCsvRowSchema.extend({
  title: z.string().nullable(),
  image: z.string().url().nullable(),
  brand: z.string().nullable(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  status: shopeeScanStatusSchema,
  error: z.string().optional(),
});

export type ShopeeScanResult = z.infer<typeof shopeeScanResultSchema>;

// ---------------------------------------------------------

// 4. Skema Request API (Digunakan di route.ts untuk validasi)
export const shopeeScanRequestSchema = z.object({
  items: z.array(shopeeCsvRowSchema).min(1, "Minimal harus ada 1 item untuk diproses"),
});

export type ShopeeScanRequest = z.infer<typeof shopeeScanRequestSchema>;

// ---------------------------------------------------------

// 5. Skema Response API
export const shopeeScanResponseSchema = z.object({
  success: z.boolean(),
  total: z.number(),
  results: z.array(shopeeScanResultSchema),
  error: z.string().optional(),
});

export type ShopeeScanResponse = z.infer<typeof shopeeScanResponseSchema>;
