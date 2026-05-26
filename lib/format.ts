import {
  singingChartResponseSchema,
  type SingingChartRequest,
  type SingingChartResponse,
  type VocalistLineNote,
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

function normalizeVocalistNotes(
  value: unknown,
  request: SingingChartRequest,
  singingChart: string,
): VocalistLineNote[] {
  if (!Array.isArray(value)) {
    return buildFallbackVocalistNotes(request, singingChart);
  }

  const notes = value
    .map((item, index) => {
      const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const originalLine =
        asString(record.originalLine) || request.lyrics.split(/\r?\n/)[index] || "";
      const singingLine =
        asString(record.singingLine) || singingChart.split(/\r?\n/)[index] || originalLine;

      return {
        originalLine,
        singingLine,
        breathSuggestion: asString(record.breathSuggestion) || undefined,
        expressionNotes: asStringArray(record.expressionNotes),
        techniqueNotes: asStringArray(record.techniqueNotes),
      };
    })
    .filter((note) => note.originalLine || note.singingLine);

  return notes.length ? notes : buildFallbackVocalistNotes(request, singingChart);
}

function buildFallbackVocalistNotes(
  request: SingingChartRequest,
  singingChart: string,
): VocalistLineNote[] {
  const originalLines = request.lyrics.split(/\r?\n/).filter(Boolean);
  const singingLines = singingChart.split(/\r?\n/).filter(Boolean);
  const lines = originalLines.length ? originalLines : [request.lyrics];

  return lines.map((line, index) => ({
    originalLine: line,
    singingLine: singingLines[index] || line,
    breathSuggestion: "長い行はフレーズの切れ目で小さく吸うと安定しやすいです。",
    expressionNotes: ["語尾を押し切らず、言葉の余韻を残します。"],
    techniqueNotes: ["子音を立てすぎず、母音の流れを保ちます。"],
  }));
}

export function normalizeSingingChartResponse(
  raw: unknown,
  request: SingingChartRequest,
  rawText = "",
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
    misreadNotes: asStringArray(record.misreadNotes, [
      "AI出力のJSON整形が崩れたため、原文に近い形で仮表示しています。",
      "漢字や固有名詞はSuno用にひらがな表記を添えると安定しやすいです。",
    ]),
    vocalistNotes: normalizeVocalistNotes(record.vocalistNotes, request, singingChart),
    trainerNotes:
      asString(record.trainerNotes) ||
      (rawText
        ? `JSONとして解析できない出力が含まれました。再生成すると整う場合があります。\n\n${rawText}`
        : "生徒に渡す場合は、ブレス位置と語尾の処理を先に固定してから練習すると整理しやすいです。"),
    practiceTasks: asStringArray(record.practiceTasks, [
      "歌唱譜を一行ずつ読み上げ、伸ばす音と詰める音を確認する",
      "ブレス位置を決めて、同じ位置で3回通して歌う",
    ]),
  };
}

export function formatVocalistNotesForCopy(notes: VocalistLineNote[]) {
  return notes
    .map((note, index) => {
      const expression = note.expressionNotes.map((line) => `- ${line}`).join("\n");
      const technique = note.techniqueNotes.map((line) => `- ${line}`).join("\n");

      return `${index + 1}行目:
${note.singingLine}

原文:
${note.originalLine}

ブレス:
${note.breathSuggestion || "指定なし"}

表現:
${expression || "- 指定なし"}

テクニック:
${technique || "- 指定なし"}`;
    })
    .join("\n\n---\n\n");
}

export function formatFullResultForCopy(result: SingingChartResponse) {
  return `# ひらがな歌詞
${result.hiraganaLyrics}

# 歌唱譜
${result.singingChart}

# Suno投入用歌詞
${result.sunoLyrics}

# 読み間違い注意ポイント
${result.misreadNotes.map((note) => `- ${note}`).join("\n")}

# ボーカリスト向け歌唱メモ
${formatVocalistNotesForCopy(result.vocalistNotes)}

# ボイストレーナー向け指導メモ
${result.trainerNotes}

# 練習課題
${result.practiceTasks.map((task) => `- ${task}`).join("\n")}`;
}
