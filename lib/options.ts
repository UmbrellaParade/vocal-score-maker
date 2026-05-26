import type {
  SelectOption,
  SingingMode,
  StretchLevel,
} from "@/types/singing-chart";

export const singingModeOptions: SelectOption<SingingMode>[] = [
  { value: "misread_prevention", label: "読み間違い防止" },
  { value: "jpop_natural", label: "自然なJ-POP" },
  { value: "english_like", label: "英語風メロディー" },
  { value: "rock", label: "ロック寄り" },
  { value: "ballad", label: "バラード寄り" },
  { value: "suno_reinput", label: "Suno再投入用" },
];

export const stretchLevelOptions: SelectOption<StretchLevel>[] = [
  { value: "low", label: "少なめ" },
  { value: "standard", label: "標準" },
  { value: "high", label: "多め" },
];
