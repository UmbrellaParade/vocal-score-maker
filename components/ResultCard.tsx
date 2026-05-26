import type { ReactNode } from "react";
import { CopyButton } from "@/components/CopyButton";

type ResultCardProps = {
  title: string;
  icon: ReactNode;
  copyText: string;
  children: ReactNode;
  accent?: "rain" | "coral" | "moss" | "amber";
};

const accentClass = {
  rain: "text-rain",
  coral: "text-coral",
  moss: "text-moss",
  amber: "text-amberline",
};

export function ResultCard({
  title,
  icon,
  copyText,
  children,
  accent = "rain",
}: ResultCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-panel/88 shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={accentClass[accent]}>{icon}</span>
          <h2 className="truncate text-base font-semibold text-white">{title}</h2>
        </div>
        <CopyButton text={copyText} />
      </div>
      <div className="px-4 py-4 text-sm leading-7 text-slate-200">{children}</div>
    </article>
  );
}
