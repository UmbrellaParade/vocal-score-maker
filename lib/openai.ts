import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(apiKeyOverride?: string) {
  const apiKey = apiKeyOverride?.trim() || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  if (apiKeyOverride?.trim()) {
    return new OpenAI({ apiKey });
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
}

export function getOpenAITranscriptionModel() {
  return process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || "whisper-1";
}
