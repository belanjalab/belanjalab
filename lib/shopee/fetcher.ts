export type FetchShopeeResult = {
  success: boolean;
  html: string | null;
  status: number;
  error?: string;
};

export async function fetchShopeePage(
  productUrl: string,
): Promise<FetchShopeeResult> {
  try {
    // 1. Validasi Keamanan (SSRF): Pastikan hanya mengambil data dari domain Shopee
    const urlObj = new URL(productUrl);
    if (!urlObj.hostname.includes("shopee.co.id") && !urlObj.hostname.includes("shopee.com")) {
      throw new Error("URL ditolak. Hanya domain Shopee yang diizinkan.");
    }

    // 2. Proteksi Performa: Batasi waktu tunggu maksimal 10 detik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(urlObj.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal, // Tautkan ke pengontrol waktu
    });

    clearTimeout(timeoutId); // Matikan timer jika berhasil

    if (!response.ok) {
      return {
        success: false,
        html: null,
        status: response.status,
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();

    return {
      success: true,
      html,
      status: response.status,
    };
  } catch (error) {
    let errorMessage = "Unknown fetch error";
    if (error instanceof Error) {
      errorMessage = error.name === "AbortError" ? "Request Timeout (Koneksi terlalu lama)" : error.message;
    }
    
    return {
      success: false,
      html: null,
      status: 500,
      error: errorMessage,
    };
  }
}
