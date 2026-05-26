import {
  AlertTriangle,
  ClipboardList,
  Clock3,
  Diff,
  GraduationCap,
  Gauge,
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
  const confidenceLabel = {
    high: "高：歌詞と音源の一致が高い推定です。",
    medium: "中：一部聞き取りに不確実性があります。",
    low: "低：音源が不明瞭、または歌詞との差分が大きい可能性があります。",
  };

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

      {result.audioBasedSingingChart ? (
        <ResultCard
          title="音源ベース歌唱譜"
          icon={<ListMusic size={18} />}
          copyText={result.audioBasedSingingChart}
          accent="moss"
        >
          <pre className="copy-pre font-sans text-base">
            {result.audioBasedSingingChart}
          </pre>
        </ResultCard>
      ) : null}

      <ResultCard
        title="Suno投入用"
        icon={<Sparkles size={18} />}
        copyText={result.sunoLyrics}
        accent="amber"
      >
        <pre className="copy-pre font-sans">{result.sunoLyrics}</pre>
      </ResultCard>

      {result.analysisConfidence ? (
        <ResultCard
          title="音源解析の信頼度"
          icon={<Gauge size={18} />}
          copyText={confidenceLabel[result.analysisConfidence]}
          accent="rain"
        >
          <p className="text-slate-200">
            {confidenceLabel[result.analysisConfidence]}
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            音源解析は推定です。最終的な歌唱譜は耳で確認しながら調整してください。
          </p>
        </ResultCard>
      ) : null}

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

      {result.lyricAudioDiffNotes?.length ? (
        <ResultCard
          title="元歌詞との差分メモ"
          icon={<Diff size={18} />}
          copyText={result.lyricAudioDiffNotes
            .map((note) => `- ${note}`)
            .join("\n")}
          accent="coral"
        >
          <ul className="list-disc space-y-1 pl-5">
            {result.lyricAudioDiffNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </ResultCard>
      ) : null}

      {result.timingNotes?.length ? (
        <ResultCard
          title="タイミング付き歌唱メモ"
          icon={<Clock3 size={18} />}
          copyText={result.timingNotes
            .map((note) => {
              const range =
                note.startTime || note.endTime
                  ? `${note.startTime ?? "?"}〜${note.endTime ?? "?"}`
                  : "時刻不明";

              return `${range}\n${note.singingLine || note.originalLine}\n${note.notes
                .map((line) => `- ${line}`)
                .join("\n")}`;
            })
            .join("\n\n")}
          accent="amber"
        >
          <div className="space-y-3">
            {result.timingNotes.map((note, index) => {
              const range =
                note.startTime || note.endTime
                  ? `${note.startTime ?? "?"}〜${note.endTime ?? "?"}`
                  : "時刻不明";

              return (
                <section
                  key={`${range}-${note.singingLine}-${index}`}
                  className="rounded-lg border border-white/10 bg-white/[0.035] p-3"
                >
                  <p className="text-xs font-semibold text-amberline">{range}</p>
                  <p className="copy-pre mt-2 text-base font-semibold text-white">
                    {note.singingLine || note.originalLine}
                  </p>
                  {note.originalLine ? (
                    <p className="copy-pre mt-1 text-xs text-slate-400">
                      原文: {note.originalLine}
                    </p>
                  ) : null}
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                    {note.notes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </ResultCard>
      ) : null}

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
