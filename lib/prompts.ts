import {
  detailLevelOptions,
  singingModeOptions,
  skillLevelOptions,
  stretchLevelOptions,
  useCaseOptions,
  vocalTypeOptions,
} from "@/lib/options";
import type { SelectOption, SingingChartRequest } from "@/types/singing-chart";

export const singingChartSystemPrompt = `あなたは「歌唱譜メーカー」です。

ユーザーが入力した通常歌詞を、SunoなどのAI歌唱ツールで読み間違いしにくく、メロディーに乗せやすい歌唱譜へ変換します。
また、必要に応じてボーカリスト向けに、ブレス位置、ビブラート、強弱、しゃくり、フォール、発声の注意点、感情表現、練習課題を提案します。

目的は、綺麗な歌詞カードを作ることではありません。
実際に歌う時の発音、伸ばし、詰め、区切り、表現を分かりやすくすることです。

重要ルール：
- 漢字は必要に応じてひらがな化する
- 読み間違いしやすい言葉には注意を出す
- 伸ばす音は「ー」で表記する
- 詰める音は「っ」で表記する
- 大きなフレーズ区切りは「/」で表記する
- 小さな区切りは空白または「｜」で表記する
- 歌唱上の「あぁ」「えぇ」などの装飾音も必要なら提案する
- Suno用では読みやすく、誤読されにくい表記を優先する
- ボーカリスト用ではブレス、ビブラート、強弱、発声、感情表現のアドバイスを入れる
- ボイストレーナー用では、生徒に説明しやすい指導メモと練習課題を出す
- 医療的・身体診断的な断定表現や「必ず上手くなる」といった断定は避ける
- 完璧な譜面ではなく、歌唱の下書きとして使える実用性を優先する
- 既存曲の歌唱をコピーするためではなく、ユーザー自身の歌唱設計を補助する

出力は必ずJSON形式にしてください。Markdownや説明文をJSONの外側に出してはいけません。`;

function labelFor<T extends string>(
  options: SelectOption<T>[],
  value: T | undefined,
) {
  return options.find((option) => option.value === value)?.label ?? value ?? "指定なし";
}

export function buildSingingChartUserPrompt(input: SingingChartRequest) {
  return `以下の歌詞を歌唱譜に変換してください。

通常歌詞：
${input.lyrics}

曲の雰囲気：
${input.mood || "指定なし"}

用途：
${labelFor(useCaseOptions, input.useCase)}

譜割りモード：
${labelFor(singingModeOptions, input.singingMode)}

伸ばし表記の強さ：
${labelFor(stretchLevelOptions, input.stretchLevel)}

歌唱メモの詳しさ：
${labelFor(detailLevelOptions, input.detailLevel)}

ボーカルタイプ：
${labelFor(vocalTypeOptions, input.vocalType)}

歌唱レベル：
${labelFor(skillLevelOptions, input.skillLevel)}

出力形式：
{
  "hiraganaLyrics": "",
  "singingChart": "",
  "sunoLyrics": "",
  "misreadNotes": [],
  "vocalistNotes": [
    {
      "originalLine": "",
      "singingLine": "",
      "breathSuggestion": "",
      "expressionNotes": [],
      "techniqueNotes": []
    }
  ],
  "trainerNotes": "",
  "practiceTasks": []
}`;
}
