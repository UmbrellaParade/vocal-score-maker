# 歌唱譜メーカー

通常歌詞と音源をもとに、Sunoでも人間でも歌いやすい「歌唱譜」へ整えるWebツールです。

## 利用者ができること

- OpenAI APIキーを入力する
- 通常歌詞を入力する
- 必要なら音源ファイルをアップロードする
- 曲の雰囲気を任意で入力する
- 伸ばし表記を選ぶ
- ひらがな歌詞、歌唱譜、Suno投入用歌詞をコピーする

入力されたOpenAI APIキーは生成時だけ使い、アプリ側には保存しません。

## 公開URL

https://vocal-score-maker.vercel.app

## 開発者向け

```bash
npm install
npm run dev
```

ローカル開発時は、画面のAPIキー欄にOpenAI APIキーを入力して生成します。

## ビルド確認

```bash
npm run build
```
