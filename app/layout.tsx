import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "歌唱譜メーカー",
  description: "通常歌詞と音源をもとに、Sunoでも人間でも歌いやすい歌唱譜へ整えます。",
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
