"use client";

type LyricsInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LyricsInput({ value, onChange }: LyricsInputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-200">通常歌詞</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={"ねぇ まただよ通知一つで\n胸がざわつく"}
        className="min-h-56 w-full rounded-lg border border-white/10 bg-ink/80 p-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-rain/60 focus:ring-2 focus:ring-rain/25"
      />
    </label>
  );
}
