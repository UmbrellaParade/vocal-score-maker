import {
  singingChartResponseSchema,
  type SingingChartRequest,
  type SingingChartResponse,
} from "@/types/singing-chart";

export function parseJsonFromModel(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }

    throw new Error("JSON response could not be parsed.");
  }
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-・\s]+/, "").trim())
      .filter(Boolean);
  }

  return fallback;
}

export function normalizeSingingChartResponse(
  raw: unknown,
  request: SingingChartRequest,
): SingingChartResponse {
  const parsed = singingChartResponseSchema.safeParse(raw);

  if (parsed.success) {
    return parsed.data;
  }

  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const singingChart = asString(record.singingChart) || request.lyrics;

  return {
    hiraganaLyrics: asString(record.hiraganaLyrics) || request.lyrics,
    singingChart,
    sunoLyrics: asString(record.sunoLyrics) || singingChart.replaceAll(" / ", "\n"),
    lyricAudioDiffNotes: asStringArray(record.lyricAudioDiffNotes, [
      "AI出力のJSON整形が崩れたため、元歌詞に近い形で仮表示しています。",
    ]),
    misreadNotes: asStringArray(record.misreadNotes, [
      "漢字や固有名詞は、Suno用ではひらがな表記を添えると安定しやすいです。",
    ]),
  };
}

export function formatFullResultForCopy(result: SingingChartResponse) {
  return `# ひらがな歌詞
${result.hiraganaLyrics}

# 歌唱譜
${result.singingChart}

# Suno投入用歌詞
${result.sunoLyrics}

# 元歌詞との差分メモ
${result.lyricAudioDiffNotes.map((note) => `- ${note}`).join("\n")}

# 読み間違い注意ポイント
${result.misreadNotes.map((note) => `- ${note}`).join("\n")}`;
}
