"use client";

import { LoaderCircle, Music2, WandSparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { LyricsInput } from "@/components/LyricsInput";
import { ModeSelector } from "@/components/ModeSelector";
import { SingingChartView } from "@/components/SingingChartView";
import {
  detailLevelOptions,
  singingModeOptions,
  skillLevelOptions,
  stretchLevelOptions,
  useCaseOptions,
  vocalTypeOptions,
} from "@/lib/options";
import type {
  DetailLevel,
  SingingChartRequest,
  SingingChartResponse,
  SingingMode,
  SkillLevel,
  StretchLevel,
  UseCase,
  VocalType,
} from "@/types/singing-chart";

const sampleLyrics = "ねぇ まただよ通知一つで\n胸がざわつく";

const defaultForm: SingingChartRequest = {
  lyrics: "",
  mood: "切ないJ-POP",
  useCase: "both",
  singingMode: "jpop_natural",
  stretchLevel: "standard",
  detailLevel: "standard",
  vocalType: "unspecified",
  skillLevel: "intermediate",
};

export default function Home() {
  const [form, setForm] = useState<SingingChartRequest>(defaultForm);
  const [result, setResult] = useState<SingingChartResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField<K extends keyof SingingChartRequest>(
    key: K,
    value: SingingChartRequest[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-singing-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        result?: SingingChartResponse;
        error?: string;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error || "生成に失敗しました。");
      }

      setResult(payload.result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "生成に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-lg border border-rain/25 bg-rain/10 px-3 py-1 text-xs font-semibold text-rain">
              <Music2 size={14} />
              Suno / Vocal Note MVP
            </p>
            <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">
              歌唱譜メーカー
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              通常歌詞を、読みやすいひらがな・歌唱譜・Suno投入用・ボーカルノートへ整えます。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, lyrics: sampleLyrics }))}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-slate-100 transition hover:border-coral/60 hover:bg-coral/10 focus:outline-none focus:ring-2 focus:ring-coral/35"
          >
            <Music2 size={16} />
            サンプル
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(340px,430px)_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-lg border border-white/10 bg-panel/90 p-4 shadow-glow lg:sticky lg:top-5"
          >
            <div className="space-y-5">
              <LyricsInput
                value={form.lyrics}
                onChange={(value) => updateField("lyrics", value)}
              />

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">曲の雰囲気</span>
                <input
                  value={form.mood ?? ""}
                  onChange={(event) => updateField("mood", event.target.value)}
                  placeholder="切ないJ-POP / 明るいポップロック"
                  className="h-11 w-full rounded-lg border border-white/10 bg-ink/80 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-rain/60 focus:ring-2 focus:ring-rain/25"
                />
              </label>

              <ModeSelector<UseCase>
                label="用途"
                value={form.useCase}
                options={useCaseOptions}
                onChange={(value) => updateField("useCase", value)}
              />

              <ModeSelector<SingingMode>
                label="譜割りモード"
                value={form.singingMode}
                options={singingModeOptions}
                onChange={(value) => updateField("singingMode", value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <ModeSelector<StretchLevel>
                  label="伸ばし表記"
                  value={form.stretchLevel}
                  options={stretchLevelOptions}
                  onChange={(value) => updateField("stretchLevel", value)}
                  columns="three"
                />
                <ModeSelector<DetailLevel>
                  label="歌唱メモ"
                  value={form.detailLevel}
                  options={detailLevelOptions}
                  onChange={(value) => updateField("detailLevel", value)}
                  columns="three"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-200">ボーカルタイプ</span>
                  <select
                    value={form.vocalType}
                    onChange={(event) =>
                      updateField("vocalType", event.target.value as VocalType)
                    }
                    className="h-11 w-full rounded-lg border border-white/10 bg-ink/80 px-3 text-sm text-white outline-none transition focus:border-rain/60 focus:ring-2 focus:ring-rain/25"
                  >
                    {vocalTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-200">歌唱レベル</span>
                  <select
                    value={form.skillLevel}
                    onChange={(event) =>
                      updateField("skillLevel", event.target.value as SkillLevel)
                    }
                    className="h-11 w-full rounded-lg border border-white/10 bg-ink/80 px-3 text-sm text-white outline-none transition focus:border-rain/60 focus:ring-2 focus:ring-rain/25"
                  >
                    {skillLevelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? (
                <div className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || !form.lyrics.trim()}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-rain px-4 text-sm font-bold text-ink transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-rain/40 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <WandSparkles size={18} />
                )}
                {isLoading ? "生成中" : "生成する"}
              </button>
            </div>
          </form>

          <section className="min-h-[480px]">
            {result ? (
              <SingingChartView result={result} />
            ) : (
              <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
                <div>
                  <WandSparkles className="mx-auto text-rain" size={32} />
                  <p className="mt-3 text-lg font-semibold text-white">
                    生成結果がここに表示されます
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    左の入力欄に歌詞を入れて生成してください。
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
