import type {
  SelectOption,
  StretchLevel,
} from "@/types/singing-chart";

export const stretchLevelOptions: SelectOption<StretchLevel>[] = [
  { value: "low", label: "控えめ" },
  { value: "standard", label: "標準" },
  { value: "high", label: "多め" },
];
