"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export function CopyButton({ text, label = "コピー" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={label}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-medium text-slate-100 transition hover:border-rain/50 hover:bg-rain/10 focus:outline-none focus:ring-2 focus:ring-rain/40"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      <span>{copied ? "コピー済み" : label}</span>
    </button>
  );
}
