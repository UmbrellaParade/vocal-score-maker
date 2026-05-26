"use client";

import type { SelectOption } from "@/types/singing-chart";

type ModeSelectorProps<T extends string> = {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  columns?: "two" | "three";
};

export function ModeSelector<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = "two",
}: ModeSelectorProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-200">{label}</legend>
      <div
        className={
          columns === "three"
            ? "grid grid-cols-1 gap-2 sm:grid-cols-3"
            : "grid grid-cols-1 gap-2 sm:grid-cols-2"
        }
      >
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-10 rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-rain/40 ${
                isActive
                  ? "border-rain/70 bg-rain/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.07]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
