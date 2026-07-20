export function requireOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("OPENAI_API_KEY belum dikonfigurasi.");
  }

  return key;
}
