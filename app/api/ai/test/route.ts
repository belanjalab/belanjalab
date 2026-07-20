import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "OPENAI_API_KEY belum dikonfigurasi." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();

      return NextResponse.json(
        {
          success: false,
          error: "Gagal terhubung ke OpenAI.",
          detail: body,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: "BelanjaLab berhasil terhubung ke OpenAI.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
