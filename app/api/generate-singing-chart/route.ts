import { NextResponse } from "next/server";
import { normalizeSingingChartResponse, parseJsonFromModel } from "@/lib/format";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import {
  buildSingingChartUserPrompt,
  singingChartSystemPrompt,
} from "@/lib/prompts";
import { singingChartRequestSchema } from "@/types/singing-chart";

export const runtime = "nodejs";

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

    const client = getOpenAIClient();
    const input = parsed.data;

    const completion = await client.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.65,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: singingChartSystemPrompt },
        { role: "user", content: buildSingingChartUserPrompt(input) },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const raw = parseJsonFromModel(content);
    const result = normalizeSingingChartResponse(raw, input, content);

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const friendlyMessage =
      message === "OPENAI_API_KEY is not set."
        ? "OPENAI_API_KEY が未設定です。.env.local にAPIキーを設定してください。"
        : "歌唱譜の生成中にエラーが発生しました。時間をおいて再試行してください。";

    return NextResponse.json(
      {
        error: friendlyMessage,
        detail:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
