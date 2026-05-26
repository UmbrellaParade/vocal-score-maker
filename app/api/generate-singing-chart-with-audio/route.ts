import { toFile } from "openai/uploads";
import { NextResponse } from "next/server";
import { buildAudioAnalysisSummary } from "@/lib/audio-analysis";
import { normalizeSingingChartResponse, parseJsonFromModel } from "@/lib/format";
import {
  getOpenAIClient,
  getOpenAIModel,
  getOpenAITranscriptionModel,
} from "@/lib/openai";
import {
  buildAudioSingingChartUserPrompt,
  singingChartSystemPrompt,
} from "@/lib/prompts";
import { singingChartRequestSchema } from "@/types/singing-chart";

export const runtime = "nodejs";
export const maxDuration = 120;

const maxAudioBytes = 4 * 1024 * 1024;
const allowedExtensions = new Set(["mp3", "wav", "m4a", "aac"]);
const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/m4a",
  "audio/aac",
  "application/octet-stream",
]);

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isSupportedAudioFile(file: File) {
  const extension = getExtension(file.name);
  const mimeType = file.type || "application/octet-stream";

  return allowedExtensions.has(extension) || allowedMimeTypes.has(mimeType);
}

function createAudioError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioEntry = formData.get("audioFile");

    if (!(audioEntry instanceof File) || audioEntry.size === 0) {
      return createAudioError("音源ファイルを選択してください。");
    }

    if (!isSupportedAudioFile(audioEntry)) {
      return createAudioError("対応している音源形式は mp3 / wav / m4a / aac です。");
    }

    if (audioEntry.size > maxAudioBytes) {
      return createAudioError("音源ファイルは4MB以内にしてください。");
    }

    const parsed = singingChartRequestSchema.safeParse({
      lyrics: getField(formData, "lyrics"),
      mood: getField(formData, "mood"),
      stretchLevel: getField(formData, "stretchLevel"),
    });

    if (!parsed.success) {
      return createAudioError(
        parsed.error.issues[0]?.message || "入力内容を確認してください。",
      );
    }

    const requestApiKey = getField(formData, "openaiApiKey")?.trim();
    const client = getOpenAIClient(requestApiKey);
    const input = parsed.data;
    const transcriptionModel = getOpenAITranscriptionModel();
    const useVerboseTranscription = transcriptionModel === "whisper-1";
    const audioUpload = await toFile(await audioEntry.arrayBuffer(), audioEntry.name, {
      type: audioEntry.type || "application/octet-stream",
    });

    const transcription = await client.audio.transcriptions.create({
      file: audioUpload,
      model: transcriptionModel,
      language: "ja",
      prompt: input.lyrics.slice(0, 1200),
      response_format: useVerboseTranscription ? "verbose_json" : "json",
      temperature: 0,
      ...(useVerboseTranscription
        ? { timestamp_granularities: ["segment" as const] }
        : {}),
    });

    const audioAnalysis = buildAudioAnalysisSummary(transcription, audioEntry);

    const completion = await client.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: singingChartSystemPrompt },
        { role: "user", content: buildAudioSingingChartUserPrompt(input, audioAnalysis) },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const raw = parseJsonFromModel(content);
    const result = normalizeSingingChartResponse(raw, input);

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const friendlyMessage =
      message === "OPENAI_API_KEY is not set."
        ? "OpenAI APIキーを入力してください。"
        : "音源解析または歌唱譜生成中にエラーが発生しました。音源形式や長さを確認して再試行してください。";

    return NextResponse.json(
      {
        error: friendlyMessage,
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
