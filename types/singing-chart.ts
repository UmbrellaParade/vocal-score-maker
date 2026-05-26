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

export const useCaseSchema = z.enum(useCaseValues);
export const singingModeSchema = z.enum(singingModeValues);
export const stretchLevelSchema = z.enum(stretchLevelValues);
export const detailLevelSchema = z.enum(detailLevelValues);
export const vocalTypeSchema = z.enum(vocalTypeValues);
export const skillLevelSchema = z.enum(skillLevelValues);

export type UseCase = z.infer<typeof useCaseSchema>;
export type SingingMode = z.infer<typeof singingModeSchema>;
export type StretchLevel = z.infer<typeof stretchLevelSchema>;
export type DetailLevel = z.infer<typeof detailLevelSchema>;
export type VocalType = z.infer<typeof vocalTypeSchema>;
export type SkillLevel = z.infer<typeof skillLevelSchema>;

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
});

export type SingingChartRequest = z.infer<typeof singingChartRequestSchema>;

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
  sunoLyrics: z.string(),
  misreadNotes: z.array(z.string()),
  vocalistNotes: z.array(vocalistLineNoteSchema),
  trainerNotes: z.string(),
  practiceTasks: z.array(z.string()),
});

export type SingingChartResponse = z.infer<typeof singingChartResponseSchema>;
