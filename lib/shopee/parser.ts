import * as cheerio from 'cheerio';
import { decode } from 'html-entities';

export type ParsedShopeeProduct = {
  title: string | null;
  image: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
};

export function parseShopeeHtml(html: string): ParsedShopeeProduct {
  const $ = cheerio.load(html);

  // 1. Ambil data dasar dari Meta Tags (Lebih stabil dari Regex)
  let title = $('meta[property="og:title"]').attr('content') || $('title').text() || null;
  const image = $('meta[property="og:image"]').attr('content') || null;
  const description = $('meta[property="og:description"]').attr('content') || null;

  let brand: string | null = null;
  let category: string | null = null;

  // 2. Cari data terstruktur di dalam JSON-LD (Sangat akurat untuk E-Commerce)
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const scriptContent = $(element).html();
      if (scriptContent) {
        const jsonData = JSON.parse(scriptContent);
        
        // Memastikan tipe JSON adalah Produk
        if (jsonData['@type'] === 'Product') {
          brand = jsonData.brand?.name || brand;
          category = jsonData.category || category;
          if (!title) title = jsonData.name || null;
        }
      }
    } catch (e) {
      // Abaikan error jika JSON dari Shopee cacat
    }
  });

  // 3. Bersihkan karakter HTML (misal: "&amp;" menjadi "&")
  return {
    title: title ? decode(title) : null,
    image,
    brand,
    category,
    description: description ? decode(description) : null,
  };
}
