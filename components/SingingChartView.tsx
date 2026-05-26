import {
  AlertTriangle,
  Diff,
  ListMusic,
  Music2,
  Sparkles,
} from "lucide-react";
import { ResultCard } from "@/components/ResultCard";
import type { SingingChartResponse } from "@/types/singing-chart";

type SingingChartViewProps = {
  result: SingingChartResponse;
};

export function SingingChartView({ result }: SingingChartViewProps) {
  return (
    <div className="space-y-4">
      <ResultCard
        title="ひらがな歌詞"
        icon={<Music2 size={18} />}
        copyText={result.hiraganaLyrics}
        accent="rain"
      >
        <pre className="copy-pre font-sans">{result.hiraganaLyrics}</pre>
      </ResultCard>

      <ResultCard
        title="歌唱譜"
        icon={<ListMusic size={18} />}
        copyText={result.singingChart}
        accent="coral"
      >
        <pre className="copy-pre font-sans text-base">{result.singingChart}</pre>
      </ResultCard>

      <ResultCard
        title="Suno投入用歌詞"
        icon={<Sparkles size={18} />}
        copyText={result.sunoLyrics}
        accent="amber"
      >
        <pre className="copy-pre font-sans">{result.sunoLyrics}</pre>
      </ResultCard>

      <ResultCard
        title="元歌詞との差分メモ"
        icon={<Diff size={18} />}
        copyText={result.lyricAudioDiffNotes
          .map((note) => `- ${note}`)
          .join("\n")}
        accent="moss"
      >
        <ul className="list-disc space-y-1 pl-5">
          {result.lyricAudioDiffNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </ResultCard>

      <ResultCard
        title="読み間違い注意ポイント"
        icon={<AlertTriangle size={18} />}
        copyText={result.misreadNotes.map((note) => `- ${note}`).join("\n")}
        accent="amber"
      >
        <ul className="list-disc space-y-1 pl-5">
          {result.misreadNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </ResultCard>
    </div>
  );
}
