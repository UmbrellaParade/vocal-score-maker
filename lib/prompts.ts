import { singingModeOptions, stretchLevelOptions } from "@/lib/options";
import type { AudioAnalysisSummary } from "@/lib/audio-analysis";
import type { SelectOption, SingingChartRequest } from "@/types/singing-chart";

export const singingChartSystemPrompt = `あなたは「歌唱譜メーカー」です。

通常歌詞を、Sunoでも人間でも歌いやすい「歌唱譜」へ変換します。
目的は歌唱指導ではなく、歌詞を実際に歌いやすい発音・伸ばし・区切りへ自然に整えることです。

共通ルール：
- 元歌詞の意味を崩さない
- 音源がある場合は、音源の歌い方を参考にする
- 音源がない場合は、自然なJ-POPの譜割りを推定する
- 伸ばしている箇所は「ー」で表記する
- 詰めている箇所は「っ」で表記する
- 大きな区切りは「/」で表記する
- 小さな区切りは半角スペースで表記する
- Sunoが読み間違えやすい漢字はひらがなにする
- ひらがな化しすぎて読みにくくならないようにする
- 過剰な装飾音は入れない
- ブレス、ビブラート、発声指導、練習課題は出さない
- 既存曲の完全コピーではなく、ユーザー自身の歌唱設計を補助する

ふわり補正は常にONです。
- 歌詞を細かく分解しすぎない
- 伸ばし表記を過剰に入れすぎない
- 区切り記号を多用しすぎない
- 歌詞の意味と流れを崩さない
- AIが読みやすく、人間が見ても自然な表記にする
- 歌唱譜として分かりやすいが、カチカチの譜面にはしすぎない
- 迷った場合は、自然で軽やかな表記を優先する

出力は必ずJSON形式にしてください。Markdownや説明文をJSONの外側に出してはいけません。`;

function labelFor<T extends string>(
  options: SelectOption<T>[],
  value: T | undefined,
) {
  return options.find((option) => option.value === value)?.label ?? value ?? "指定なし";
}

function buildCommonInputText(input: SingingChartRequest) {
  return `通常歌詞：
${input.lyrics}

曲の雰囲気：
${input.mood || "指定なし"}

歌唱譜タイプ：
${labelFor(singingModeOptions, input.singingMode)}

伸ばし表記：
${labelFor(stretchLevelOptions, input.stretchLevel)}`;
}

const outputFormat = `出力形式：
{
  "hiraganaLyrics": "",
  "singingChart": "",
  "sunoLyrics": "",
  "lyricAudioDiffNotes": [],
  "misreadNotes": []
}`;

export function buildSingingChartUserPrompt(input: SingingChartRequest) {
  return `以下の歌詞を、シンプルで自然な歌唱譜に変換してください。

${buildCommonInputText(input)}

音源：
なし。自然なJ-POPの譜割りを推定してください。

${outputFormat}`;
}

export function buildAudioSingingChartUserPrompt(
  input: SingingChartRequest,
  audioAnalysis: AudioAnalysisSummary,
) {
  return `以下の元歌詞と、アップロード音源から推定された文字起こし・タイミングを照合して、シンプルで自然な歌唱譜を生成してください。

${buildCommonInputText(input)}

音源ファイル：
${audioAnalysis.fileName} (${audioAnalysis.fileType})

音源文字起こし：
${audioAnalysis.transcriptionText || "文字起こしなし"}

音源タイミング候補：
${audioAnalysis.segmentSummary || "タイミング情報なし"}

音源解析ありの場合の追加ルール：
- 音源の歌い方を参考にするが、元歌詞の意味と流れを優先する
- 音源で伸ばしている可能性が高い箇所は、必要な範囲で「ー」を入れる
- 音源で詰めている可能性が高い箇所は、必要な範囲で「っ」や自然な圧縮読みを使う
- 元歌詞と音源の発音が違う場合は、lyricAudioDiffNotes に簡潔に書く
- 聞き取りが不確実な箇所は断定せず「可能性があります」と書く
- 音源解析は推定として扱い、過剰に細かいタイミング情報は出さない

${outputFormat}`;
}
