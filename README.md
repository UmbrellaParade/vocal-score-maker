# 歌唱譜メーカー

通常歌詞と音源をもとに、Sunoでも人間でも歌いやすい「歌唱譜」へ整えるMVPです。

## 機能

- 通常歌詞を入力
- 音源ファイルをアップロード
- 曲の雰囲気、歌唱譜タイプ、伸ばし表記を指定
- OpenAI APIでひらがな歌詞、歌唱譜、Suno投入用歌詞を生成
- 元歌詞との差分メモ、読み間違い注意ポイントを表示
- 各出力カードをコピー
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

## 公開URL

Vercelで公開しています。

https://vocal-score-maker.vercel.app

生成機能を本番環境で使うには、VercelのProject Settings > Environment Variablesに以下を設定してください。

- `OPENAI_API_KEY`
- `OPENAI_MODEL` 任意。標準は `gpt-4.1-mini`
- `OPENAI_TRANSCRIPTION_MODEL` 任意。標準は `whisper-1`

## ビルド確認

```bash
npm run build
```
