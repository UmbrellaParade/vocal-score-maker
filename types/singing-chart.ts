import { z } from "zod";

export const stretchLevelValues = ["low", "standard", "high"] as const;

export const stretchLevelSchema = z.enum(stretchLevelValues);

export type StretchLevel = z.infer<typeof stretchLevelSchema>;

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export const singingChartRequestSchema = z.object({
  lyrics: z.string().trim().min(1, "通常歌詞を入力してください。").max(6000),
  mood: z.string().trim().max(200).optional().or(z.literal("")),
  stretchLevel: stretchLevelSchema.default("standard"),
});

export type SingingChartRequest = z.infer<typeof singingChartRequestSchema>;

export const singingChartResponseSchema = z.object({
  hiraganaLyrics: z.string(),
  singingChart: z.string(),
  sunoLyrics: z.string(),
  lyricAudioDiffNotes: z.array(z.string()),
  misreadNotes: z.array(z.string()),
});

export type SingingChartResponse = z.infer<typeof singingChartResponseSchema>;
