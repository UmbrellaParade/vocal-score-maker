import { stretchLevelOptions } from "@/lib/options";
import type { AudioAnalysisSummary } from "@/lib/audio-analysis";
import type {
  SelectOption,
  SingingChartRequest,
  SingingChartResponse,
} from "@/types/singing-chart";

export const singingChartSystemPrompt = `あなたは「歌唱譜メーカー」です。

通常歌詞を、Sunoでも人間でも歌いやすい「歌唱譜」へ変換します。
これは単なるひらがな変換ではありません。実際に歌う時の発音、伸ばし、詰め、区切り、余韻が分かる「音の形」へ整える仕事です。

絶対ルール：
- 元歌詞の改行と空行をできるだけ保持する
- singingChart は必ず複数行で出力する。元歌詞が複数行なら1行の長い文字列にしてはいけない
- ひらがなにするだけでは不十分。歌唱上の伸び、詰め、母音の流れを入れる
- 行末、感情語、決め言葉、母音が残りやすい言葉には自然に「ー」を入れる
- 詰まりそうな箇所には自然に「っ」や圧縮読みを使う
- 必要なら母音を自然に追加する。例：ゆびさき → ゆびいさきー、いっぱい → いーっぱーい
- 大きなフレーズ区切りだけ「/」を使う。すべての文節を「/」で区切らない
- 小さなまとまりは半角スペースで作る
- 英語は基本そのまま残す。無理にひらがな化しない
- Suno投入用歌詞も、歌唱譜の改行とブロック感を活かして整える
- ブレス、ビブラート、発声指導、練習課題は出さない
- 既存曲の完全コピーではなく、ユーザー自身の歌唱設計を補助する

ふわり補正は常にONです。
- 歌詞を細かく分解しすぎない
- 区切り記号を多用しすぎない
- 伸ばし表記を過剰に入れすぎない
- 歌詞の意味と流れを崩さない
- AIが読みやすく、人間が見ても自然な表記にする
- 迷った場合は自然で軽やかな表記を優先する

残響リリックメーカー連携を見据えたルール：
- 歌詞の文字数ではなく、歌唱上の音数を意識する
- 伸ばす位置、詰める位置、フレーズの切れ目を明確にする
- 後から別歌詞に差し替えたときに、同じ譜割りを再現できる形にする

悪い歌唱譜：
ねえ / まただよ / つうち ひとつで / むねが ざわつく

良い歌唱譜：
ねぇー / まーただよ ー
つうちー ひとっつで ー/ むねがー ざーわーつくー

出力は必ずJSON形式にしてください。Markdownや説明文をJSONの外側に出してはいけません。`;

function labelFor<T extends string>(
  options: SelectOption<T>[],
  value: T | undefined,
) {
  return options.find((option) => option.value === value)?.label ?? value ?? "指定なし";
}

function buildLineStructure(lyrics: string) {
  return lyrics
    .split(/\r?\n/)
    .map((line, index) => {
      const label = line.trim() ? line : "[空行]";
      return `${index + 1}: ${label}`;
    })
    .join("\n");
}

function buildStretchInstruction(input: SingingChartRequest) {
  const label = labelFor(stretchLevelOptions, input.stretchLevel);

  if (input.stretchLevel === "low") {
    return `${label}。ただし歌唱譜として分かるよう、行末や決め言葉には最低限の「ー」を入れる。`;
  }

  if (input.stretchLevel === "high") {
    return `${label}。ただし過剰に伸ばしすぎず、歌詞の流れが自然に見える範囲にする。`;
  }

  return `${label}。自然な余韻が分かる程度に「ー」を入れる。`;
}

function buildCommonInputText(input: SingingChartRequest) {
  return `通常歌詞：
${input.lyrics}

元歌詞の行構造：
${buildLineStructure(input.lyrics)}

曲の雰囲気：
${input.mood || "指定なし"}

伸ばし表記：
${buildStretchInstruction(input)}`;
}

const outputFormat = `出力形式：
{
  "hiraganaLyrics": "元歌詞の改行と空行を保持した、読みやすいひらがな歌詞",
  "singingChart": "元歌詞の改行と空行を保持した、伸ばし・詰め・区切り・余韻が分かる歌唱譜",
  "sunoLyrics": "Sunoへ投入しやすいように改行と表記を整えた歌詞",
  "lyricAudioDiffNotes": ["元歌詞と歌唱譜、または音源がある場合は音源との差分メモ"],
  "misreadNotes": ["読み間違いしやすい漢字や表記の注意点"]
}`;

const examples = `期待する歌唱譜例1：
元歌詞：
ねえ まただよ
通知ひとつで 胸がざわつく

既読になって 止まる指先
送らない言葉で 頭がいっぱい

歌唱譜：
ねぇー / まーただよ ー
つうちー ひとっつで ー/ むねがー ざーわーつくー

きどくにー なーって / とまる ゆびいさきー
おくらない ことばで / あたまーが いーっぱーい

期待する歌唱譜例2：
元歌詞：
渇くまで抱きしめて
息もできないくらいでいい
逃げられないように 強く Stronger
壊れるギリギリ その手で Hold me
ねえ あなたじゃなきゃダメなの

歌唱譜：
かわくまでー / だきしめてー
いきも できないくらいで / いいー

にげられないように / つよく Stronger
こわれる ぎりぎり / そのてで Hold me

ねぇー / あなたじゃなきゃ ダメなのー`;

export function buildSingingChartUserPrompt(input: SingingChartRequest) {
  return `以下の歌詞を、単なるひらがな変換ではなく、実際に歌う時の「音の形」が分かる歌唱譜に変換してください。

${buildCommonInputText(input)}

音源：
なし。自然なJ-POP歌唱として、メロディーに乗った時の伸ばし・詰め・余韻を推定してください。

内部自動判定：
- 読み間違いしやすい漢字はひらがなにする
- バラード調なら余白と伸ばしを少し多めにする
- ロック調なら勢いを残し、詰めや区切りを自然に入れる
- 英語風メロディーなら必要に応じて圧縮読みを使う
- Suno再投入に向くように、読みやすく改行を整える
- サビらしい箇所や決め言葉は少し伸ばしを多めにする

品質チェック：
- singingChart が1行の長い文字列になっていたら失敗
- 元歌詞の空行が消えていたら失敗
- 「ー」がほとんどなく、単なるひらがな変換に見えたら失敗
- 「/」が多すぎて文節ごとに区切られていたら失敗

${examples}

${outputFormat}`;
}

export function buildAudioSingingChartUserPrompt(
  input: SingingChartRequest,
  audioAnalysis: AudioAnalysisSummary,
) {
  return `以下の元歌詞と、アップロード音源から推定された文字起こし・タイミングを照合して、実際に歌う時の「音の形」が分かる歌唱譜を生成してください。

${buildCommonInputText(input)}

音源ファイル：
${audioAnalysis.fileName} (${audioAnalysis.fileType})

音源文字起こし：
${audioAnalysis.transcriptionText || "文字起こしなし"}

音源タイミング候補：
${audioAnalysis.segmentSummary || "タイミング情報なし"}

音源解析ありの場合の追加ルール：
- 音源の歌い方を優先する。ただし元歌詞の意味と改行構造はできるだけ保つ
- 音源で伸ばしている可能性が高い箇所は、必要な範囲で「ー」を入れる
- 音源で詰めている可能性が高い箇所は、必要な範囲で「っ」や自然な圧縮読みを使う
- 音源で語尾が残っている箇所は、行末やフレーズ末に余韻を作る
- 元歌詞と音源の発音が違う場合は、lyricAudioDiffNotes に簡潔に書く
- 聞き取りが不確実な箇所は断定せず「可能性があります」と書く
- 音源解析は推定として扱い、過剰に細かいタイミング情報は出さない
- Suno再投入に向くように、読みやすく改行を整える

品質チェック：
- singingChart が1行の長い文字列になっていたら失敗
- 元歌詞の空行が消えていたら失敗
- 「ー」がほとんどなく、単なるひらがな変換に見えたら失敗
- 「/」が多すぎて文節ごとに区切られていたら失敗

${examples}

${outputFormat}`;
}

export function buildSingingChartRepairPrompt(
  input: SingingChartRequest,
  currentResult: SingingChartResponse,
  audioAnalysis?: AudioAnalysisSummary,
) {
  return `前回の歌唱譜は品質不足です。以下の問題を修正して、JSON全体を再生成してください。

修正すべき問題：
- singingChart が単なるひらがな変換に近い
- singingChart の改行や空行が不足している
- 歌唱上の伸ばし「ー」、詰め「っ」、母音の流れが不足している
- 「/」で文節をつなぎすぎていて、歌唱譜として見づらい

${buildCommonInputText(input)}

${audioAnalysis ? `音源文字起こし：
${audioAnalysis.transcriptionText || "文字起こしなし"}

音源タイミング候補：
${audioAnalysis.segmentSummary || "タイミング情報なし"}
` : ""}

前回の singingChart：
${currentResult.singingChart}

必ず守ること：
- 元歌詞の改行と空行をできるだけ保持する
- 歌う時の伸ばし、詰め、区切り、余韻が分かる表記にする
- 英語は無理にひらがな化しない
- singingChart は複数行にする

${examples}

${outputFormat}`;
}
