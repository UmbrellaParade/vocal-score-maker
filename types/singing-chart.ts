import { z } from "zod";

export const useCaseValues = ["suno", "vocalist", "trainer", "both"] as const;
export const singingModeValues = [
  "misread_prevention",
  "jpop_natural",
  "english_like",
  "rock_dense",
  "ballad",
  "live",
] as const;
export const stretchLevelValues = ["low", "standard", "high"] as const;
export const detailLevelValues = ["simple", "standard", "detailed"] as const;
export const vocalTypeValues = [
  "male",
  "female",
  "high_male",
  "low_male",
  "high_female",
  "low_female",
  "unspecified",
] as const;
export const skillLevelValues = [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
] as const;
export const audioSourceTypeValues = [
  "finished_vocal_track",
  "demo_vocal",
  "suno_generated",
  "self_recorded_demo",
  "karaoke_with_vocal",
  "other",
] as const;
export const audioAnalysisModeValues = [
  "lyrics_priority",
  "audio_priority",
  "suno_reinput",
] as const;
export const analysisConfidenceValues = ["high", "medium", "low"] as const;

export const useCaseSchema = z.enum(useCaseValues);
export const singingModeSchema = z.enum(singingModeValues);
export const stretchLevelSchema = z.enum(stretchLevelValues);
export const detailLevelSchema = z.enum(detailLevelValues);
export const vocalTypeSchema = z.enum(vocalTypeValues);
export const skillLevelSchema = z.enum(skillLevelValues);
export const audioSourceTypeSchema = z.enum(audioSourceTypeValues);
export const audioAnalysisModeSchema = z.enum(audioAnalysisModeValues);
export const analysisConfidenceSchema = z.enum(analysisConfidenceValues);

export type UseCase = z.infer<typeof useCaseSchema>;
export type SingingMode = z.infer<typeof singingModeSchema>;
export type StretchLevel = z.infer<typeof stretchLevelSchema>;
export type DetailLevel = z.infer<typeof detailLevelSchema>;
export type VocalType = z.infer<typeof vocalTypeSchema>;
export type SkillLevel = z.infer<typeof skillLevelSchema>;
export type AudioSourceType = z.infer<typeof audioSourceTypeSchema>;
export type AudioAnalysisMode = z.infer<typeof audioAnalysisModeSchema>;
export type AnalysisConfidence = z.infer<typeof analysisConfidenceSchema>;

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export const singingChartRequestSchema = z.object({
  lyrics: z.string().trim().min(1, "通常歌詞を入力してください。").max(6000),
  mood: z.string().trim().max(200).optional().or(z.literal("")),
  useCase: useCaseSchema.default("both"),
  singingMode: singingModeSchema.default("jpop_natural"),
  stretchLevel: stretchLevelSchema.default("standard"),
  detailLevel: detailLevelSchema.default("standard"),
  vocalType: vocalTypeSchema.default("unspecified"),
  skillLevel: skillLevelSchema.default("intermediate"),
  audioSourceType: audioSourceTypeSchema.default("suno_generated"),
  audioAnalysisMode: audioAnalysisModeSchema.default("lyrics_priority"),
});

export type SingingChartRequest = z.infer<typeof singingChartRequestSchema>;

export const timingNoteSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  originalLine: z.string(),
  singingLine: z.string(),
  notes: z.array(z.string()),
});

export type TimingNote = z.infer<typeof timingNoteSchema>;

export const vocalistLineNoteSchema = z.object({
  originalLine: z.string(),
  singingLine: z.string(),
  breathSuggestion: z.string().optional(),
  expressionNotes: z.array(z.string()),
  techniqueNotes: z.array(z.string()),
});

export type VocalistLineNote = z.infer<typeof vocalistLineNoteSchema>;

export const singingChartResponseSchema = z.object({
  hiraganaLyrics: z.string(),
  singingChart: z.string(),
  audioBasedSingingChart: z.string().optional(),
  sunoLyrics: z.string(),
  misreadNotes: z.array(z.string()),
  lyricAudioDiffNotes: z.array(z.string()).optional(),
  timingNotes: z.array(timingNoteSchema).optional(),
  vocalistNotes: z.array(vocalistLineNoteSchema),
  trainerNotes: z.string(),
  practiceTasks: z.array(z.string()),
  analysisConfidence: analysisConfidenceSchema.optional(),
});

export type SingingChartResponse = z.infer<typeof singingChartResponseSchema>;
