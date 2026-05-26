import type {
  AudioAnalysisMode,
  AudioSourceType,
  DetailLevel,
  SelectOption,
  SingingMode,
  SkillLevel,
  StretchLevel,
  UseCase,
  VocalType,
} from "@/types/singing-chart";

export const useCaseOptions: SelectOption<UseCase>[] = [
  { value: "suno", label: "Suno用" },
  { value: "vocalist", label: "ボーカリスト用" },
  { value: "trainer", label: "トレーナー用" },
  { value: "both", label: "両方" },
];

export const singingModeOptions: SelectOption<SingingMode>[] = [
  { value: "misread_prevention", label: "読み間違い防止" },
  { value: "jpop_natural", label: "自然なJ-POP" },
  { value: "english_like", label: "英語風メロディー" },
  { value: "rock_dense", label: "ロック過密" },
  { value: "ballad", label: "バラード歌唱" },
  { value: "live", label: "ライブ歌唱" },
];

export const stretchLevelOptions: SelectOption<StretchLevel>[] = [
  { value: "low", label: "少なめ" },
  { value: "standard", label: "標準" },
  { value: "high", label: "多め" },
];

export const detailLevelOptions: SelectOption<DetailLevel>[] = [
  { value: "simple", label: "簡易" },
  { value: "standard", label: "標準" },
  { value: "detailed", label: "詳細" },
];

export const vocalTypeOptions: SelectOption<VocalType>[] = [
  { value: "unspecified", label: "指定なし" },
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "high_male", label: "高め男性" },
  { value: "low_male", label: "低め男性" },
  { value: "high_female", label: "高め女性" },
  { value: "low_female", label: "低め女性" },
];

export const skillLevelOptions: SelectOption<SkillLevel>[] = [
  { value: "beginner", label: "初心者" },
  { value: "intermediate", label: "中級者" },
  { value: "advanced", label: "上級者" },
  { value: "professional", label: "プロ向け" },
];

export const audioSourceTypeOptions: SelectOption<AudioSourceType>[] = [
  { value: "finished_vocal_track", label: "ボーカル入り完成音源" },
  { value: "demo_vocal", label: "仮歌音源" },
  { value: "suno_generated", label: "Suno生成音源" },
  { value: "self_recorded_demo", label: "自分で歌ったデモ" },
  { value: "karaoke_with_vocal", label: "カラオケ＋歌入り" },
  { value: "other", label: "その他" },
];

export const audioAnalysisModeOptions: SelectOption<AudioAnalysisMode>[] = [
  { value: "lyrics_priority", label: "歌詞優先" },
  { value: "audio_priority", label: "音源優先" },
  { value: "suno_reinput", label: "Suno再投入" },
];
