type TrainerNotesViewProps = {
  trainerNotes: string;
  practiceTasks: string[];
};

export function TrainerNotesView({
  trainerNotes,
  practiceTasks,
}: TrainerNotesViewProps) {
  return (
    <div className="space-y-4">
      <pre className="copy-pre font-sans text-sm leading-7 text-slate-200">
        {trainerNotes}
      </pre>
      {practiceTasks.length ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="text-sm font-semibold text-white">練習課題</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            {practiceTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
