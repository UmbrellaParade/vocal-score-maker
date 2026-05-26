import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "歌唱譜メーカー",
  description: "通常歌詞をAIにも人間にも歌いやすい歌唱譜へ変換します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
