import type { VocalistLineNote } from "@/types/singing-chart";

type VocalistNotesViewProps = {
  notes: VocalistLineNote[];
};

export function VocalistNotesView({ notes }: VocalistNotesViewProps) {
  if (!notes.length) {
    return <p className="text-slate-400">歌唱メモはまだありません。</p>;
  }

  return (
    <div className="space-y-3">
      {notes.map((note, index) => (
        <section
          key={`${note.originalLine}-${index}`}
          className="rounded-lg border border-white/10 bg-white/[0.035] p-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {index + 1}行目
          </p>
          <p className="copy-pre mt-2 text-base font-semibold text-white">
            {note.singingLine}
          </p>
          <p className="copy-pre mt-1 text-xs text-slate-400">原文: {note.originalLine}</p>
          {note.breathSuggestion ? (
            <p className="mt-3 rounded-lg border border-rain/20 bg-rain/10 px-3 py-2 text-sm text-rain">
              (B) {note.breathSuggestion}
            </p>
          ) : null}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-slate-300">表現</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
                {note.expressionNotes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">テクニック</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
                {note.techniqueNotes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
