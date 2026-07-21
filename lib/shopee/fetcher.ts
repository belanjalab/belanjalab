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
    const response = await fetch(productUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
      cache: "no-store",
    });

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
    return {
      success: false,
      html: null,
      status: 500,
      error:
        error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
}
