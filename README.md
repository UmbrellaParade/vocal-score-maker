# 歌唱譜メーカー

通常歌詞を、SunoなどのAI歌唱ツールで読み間違いしにくく、歌いやすい歌唱譜へ変換するMVPです。

## 機能

- 通常歌詞、曲の雰囲気、用途、譜割りモードを入力
- OpenAI APIでひらがな歌詞、歌唱譜、Suno投入用歌詞を生成
- 音源アップロード時は音声文字起こしを行い、音源ベース歌唱譜を生成
- 読み間違い注意、ボーカリスト向け歌唱メモ、指導メモ、練習課題を生成
- 元歌詞との差分メモ、タイミング付き歌唱メモ、解析信頼度を表示
- 各出力カードと全体結果をコピー
- JSONパース失敗時のフォールバック表示

## セットアップ

```bash
npm install
copy .env.example .env.local
```

`.env.local` に `OPENAI_API_KEY` を設定してください。必要に応じて `OPENAI_MODEL` も変更できます。
音源解析の文字起こしは、標準では `OPENAI_TRANSCRIPTION_MODEL=whisper-1` を使います。

対応音源形式は `mp3` / `wav` / `m4a` / `aac` です。音源ファイルは保存せず、解析時にOpenAI APIへ送信します。

## 開発

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## ビルド確認

```bash
npm run build
```
