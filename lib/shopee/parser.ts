export type ParsedShopeeProduct = {
  title: string | null;
  image: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
};

function extract(pattern: RegExp, html: string) {
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
}

export function parseShopeeHtml(html: string): ParsedShopeeProduct {
  const title =
    extract(/<title>(.*?)<\/title>/is, html) ??
    extract(/"name":"(.*?)"/is, html);

  const image =
    extract(/property="og:image"\s+content="(.*?)"/is, html) ??
    extract(/"image":"(.*?)"/is, html);

  const description =
    extract(/property="og:description"\s+content="(.*?)"/is, html) ??
    extract(/"description":"(.*?)"/is, html);

  const brand =
    extract(/"brand":"(.*?)"/is, html) ??
    extract(/"brand":\{"@type":"Brand","name":"(.*?)"/is, html);

  const category = extract(/"category":"(.*?)"/is, html);

  return {
    title,
    image,
    brand,
    category,
    description,
  };
}
