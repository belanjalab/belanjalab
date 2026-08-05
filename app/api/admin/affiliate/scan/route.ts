import { NextResponse } from "next/server";

import { scanAffiliateProducts } from "@/lib/affiliate-import/fetcher";
import { parseAffiliateLinks } from "@/lib/affiliate-import/parser";
import {
  MAX_AFFILIATE_SCAN_BATCH_SIZE,
  type AffiliateProductScanErrorResponse,
  type AffiliateProductScanRequest,
  type AffiliateProductScanResponse,
} from "@/lib/affiliate-import/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

function errorResponse(message: string, status: number) {
  return NextResponse.json<AffiliateProductScanErrorResponse>(
    { error: message },
    {
      status,
      headers: NO_STORE_HEADERS,
    },
  );
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false as const,
      status: 401,
      message: "Sesi admin tidak ditemukan. Silakan login ulang.",
    };
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return {
      authorized: false as const,
      status: 403,
      message: "Akun ini tidak memiliki akses admin.",
    };
  }

  return {
    authorized: true as const,
  };
}

function getRequestLinks(body: unknown) {
  if (!body || typeof body !== "object" || !("links" in body)) {
    return null;
  }

  const links = (body as AffiliateProductScanRequest).links;

  if (!Array.isArray(links)) {
    return null;
  }

  return links
    .filter((link): link is string => typeof link === "string")
    .map((link) => link.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin();

    if (!adminCheck.authorized) {
      return errorResponse(adminCheck.message, adminCheck.status);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Payload JSON tidak valid.", 400);
    }

    const links = getRequestLinks(body);

    if (!links || links.length === 0) {
      return errorResponse("Kirim minimal satu link Shopee.", 400);
    }

    if (links.length > MAX_AFFILIATE_SCAN_BATCH_SIZE) {
      return errorResponse(
        `Maksimal ${MAX_AFFILIATE_SCAN_BATCH_SIZE} link per request scan.`,
        400,
      );
    }

    const parsedLinks = parseAffiliateLinks(links.join("\n"));
    const allRowsValid =
      parsedLinks.rows.length === links.length &&
      parsedLinks.rows.every((row) => row.status === "valid");

    if (!allRowsValid) {
      const firstInvalidRow = parsedLinks.rows.find(
        (row) => row.status !== "valid",
      );

      return errorResponse(
        firstInvalidRow?.message ?? "Terdapat link Shopee yang tidak valid.",
        400,
      );
    }

    const items = await scanAffiliateProducts(parsedLinks.validLinks);
    const response: AffiliateProductScanResponse = {
      items,
      summary: {
        requestedCount: items.length,
        successCount: items.filter((item) => item.status === "success").length,
        partialCount: items.filter((item) => item.status === "partial").length,
        failedCount: items.filter((item) => item.status === "failed").length,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("Affiliate product scan failed:", error);

    return errorResponse(
      "Terjadi kesalahan saat mengambil data produk. Coba lagi.",
      500,
    );
  }
}
