import { NextResponse } from "next/server";
import type { AudioAnalysisSummary } from "@/lib/audio-analysis";
import { normalizeSingingChartResponse, parseJsonFromModel } from "@/lib/format";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import {
  buildAudioSingingChartUserPrompt,
  buildSingingChartRepairPrompt,
  buildSingingChartUserPrompt,
  singingChartSystemPrompt,
} from "@/lib/prompts";
import { needsSingingChartRepair } from "@/lib/quality";
import { singingChartRequestSchema } from "@/types/singing-chart";

export const runtime = "nodejs";

function isAudioAnalysisSummary(value: unknown): value is AudioAnalysisSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.fileName === "string" &&
    typeof record.fileType === "string" &&
    typeof record.fileSizeBytes === "number" &&
    typeof record.transcriptionText === "string" &&
    Array.isArray(record.segments) &&
    typeof record.segmentSummary === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = singingChartRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "入力内容を確認してください。",
        },
        { status: 400 },
      );
    }

    const requestApiKey = request.headers.get("x-openai-api-key")?.trim();
    const client = getOpenAIClient(requestApiKey);
    const input = parsed.data;
    const audioAnalysis = isAudioAnalysisSummary(body.audioAnalysis)
      ? body.audioAnalysis
      : undefined;

    const completion = await client.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.55,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: singingChartSystemPrompt },
        {
          role: "user",
          content: audioAnalysis
            ? buildAudioSingingChartUserPrompt(input, audioAnalysis)
            : buildSingingChartUserPrompt(input),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const raw = parseJsonFromModel(content);
    let result = normalizeSingingChartResponse(raw, input);

    if (needsSingingChartRepair(input, result)) {
      const repairCompletion = await client.chat.completions.create({
        model: getOpenAIModel(),
        temperature: 0.62,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: singingChartSystemPrompt },
          {
            role: "user",
            content: buildSingingChartRepairPrompt(input, result, audioAnalysis),
          },
        ],
      });
      const repairContent = repairCompletion.choices[0]?.message?.content ?? "";
      const repairRaw = parseJsonFromModel(repairContent);
      result = normalizeSingingChartResponse(repairRaw, input);
    }

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const friendlyMessage =
      message === "OPENAI_API_KEY is not set."
        ? "OpenAI APIキーを入力してください。"
        : "歌唱譜の生成中にエラーが発生しました。時間をおいて再試行してください。";

    return NextResponse.json(
      {
        error: friendlyMessage,
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
