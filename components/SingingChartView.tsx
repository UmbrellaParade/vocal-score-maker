import {
  AlertTriangle,
  ClipboardList,
  GraduationCap,
  ListMusic,
  Mic2,
  Music2,
  Sparkles,
} from "lucide-react";
import { ResultCard } from "@/components/ResultCard";
import { TrainerNotesView } from "@/components/TrainerNotesView";
import { VocalistNotesView } from "@/components/VocalistNotesView";
import {
  formatFullResultForCopy,
  formatVocalistNotesForCopy,
} from "@/lib/format";
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
        title="Suno投入用"
        icon={<Sparkles size={18} />}
        copyText={result.sunoLyrics}
        accent="amber"
      >
        <pre className="copy-pre font-sans">{result.sunoLyrics}</pre>
      </ResultCard>

      <ResultCard
        title="読み間違い注意"
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

      <ResultCard
        title="ボーカルノート"
        icon={<Mic2 size={18} />}
        copyText={formatVocalistNotesForCopy(result.vocalistNotes)}
        accent="moss"
      >
        <VocalistNotesView notes={result.vocalistNotes} />
      </ResultCard>

      <ResultCard
        title="指導メモと練習課題"
        icon={<GraduationCap size={18} />}
        copyText={`${result.trainerNotes}\n\n${result.practiceTasks
          .map((task) => `- ${task}`)
          .join("\n")}`}
        accent="rain"
      >
        <TrainerNotesView
          trainerNotes={result.trainerNotes}
          practiceTasks={result.practiceTasks}
        />
      </ResultCard>

      <ResultCard
        title="全体コピー"
        icon={<ClipboardList size={18} />}
        copyText={formatFullResultForCopy(result)}
        accent="coral"
      >
        <p className="text-slate-300">
          生成結果をひとまとめにしたテキストとしてコピーできます。
        </p>
      </ResultCard>
    </div>
  );
}
