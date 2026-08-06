import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BelanjaLab",
    short_name: "BelanjaLab",
    description:
      "Bandingkan produk, harga, dan skor untuk mengambil keputusan belanja yang lebih yakin.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    lang: "id-ID",
    icons: [
      {
        src: "/icon.png",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
  };
}
