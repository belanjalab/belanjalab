import "./globals.css";

export const metadata = {
  title: "BelanjaLab",
  description:
    "Platform rekomendasi dan perbandingan produk untuk belanja lebih cerdas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
