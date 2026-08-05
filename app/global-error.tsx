"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("BelanjaLab root error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <section style={{ width: "100%", maxWidth: "560px", border: "1px solid #e2e8f0", borderRadius: "28px", background: "white", padding: "40px", textAlign: "center", boxShadow: "0 18px 45px -34px rgba(15,23,42,.38)" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#c2410c" }}>
              Terjadi gangguan
            </p>
            <h1 style={{ margin: "10px 0 0", fontSize: "34px", lineHeight: 1.15, letterSpacing: "-.04em" }}>
              BelanjaLab belum dapat dimuat
            </h1>
            <p style={{ margin: "16px 0 0", fontSize: "15px", lineHeight: 1.7, color: "#475569" }}>
              Silakan coba kembali. Data yang sudah tersimpan tidak berubah.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: "44px", marginTop: "28px", border: 0, borderRadius: "12px", background: "#c2410c", padding: "0 22px", color: "white", fontWeight: 800, cursor: "pointer" }}
            >
              Coba lagi
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
