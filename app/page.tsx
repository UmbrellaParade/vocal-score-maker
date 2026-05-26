"use client";

import { FileAudio2, LoaderCircle, Music2, WandSparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { LyricsInput } from "@/components/LyricsInput";
import { ModeSelector } from "@/components/ModeSelector";
import { SingingChartView } from "@/components/SingingChartView";
import { stretchLevelOptions } from "@/lib/options";
import type {
  SingingChartRequest,
  SingingChartResponse,
  StretchLevel,
} from "@/types/singing-chart";

const sampleLyrics = "ねぇ まただよ通知一つで\n胸がざわつく";
const maxAudioBytes = 4 * 1024 * 1024;

const defaultForm: SingingChartRequest = {
  lyrics: "",
  mood: "切ないJ-POP",
  stretchLevel: "standard",
};

type GeneratePayload = {
  result?: SingingChartResponse;
  error?: string;
};

async function readGeneratePayload(response: Response): Promise<GeneratePayload> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as GeneratePayload;
  }

  const text = await response.text();

  if (response.status === 413 || text.includes("Request Entity Too Large")) {
    return {
      error:
        "音源ファイルが大きすぎます。4MB以内の音源にするか、短く書き出してから再度お試しください。",
    };
  }

  return {
    error: text || "生成に失敗しました。時間をおいて再度お試しください。",
  };
}

export default function Home() {
  const [form, setForm] = useState<SingingChartRequest>(defaultForm);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<SingingChartResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField<K extends keyof SingingChartRequest>(
    key: K,
    value: SingingChartRequest[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAudioChange(file: File | null) {
    setError("");

    if (file && file.size > maxAudioBytes) {
      setAudioFile(null);
      setError(
        "音源ファイルが大きすぎます。4MB以内の音源にするか、短く書き出してから再度お試しください。",
      );
      return;
    }

    setAudioFile(file);
  }

  function buildAudioFormData(
    input: SingingChartRequest,
    selectedAudioFile: File,
    selectedApiKey: string,
  ) {
    const formData = new FormData();

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    formData.append("audioFile", selectedAudioFile);
    formData.append("openaiApiKey", selectedApiKey);

    return formData;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedApiKey = apiKey.trim();

    if (!trimmedApiKey) {
      setError("OpenAI APIキーを入力してください。");
      return;
    }

    if (audioFile && audioFile.size > maxAudioBytes) {
      setError(
        "音源ファイルが大きすぎます。4MB以内の音源にするか、短く書き出してから再度お試しください。",
      );
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = audioFile
        ? "/api/generate-singing-chart-with-audio"
        : "/api/generate-singing-chart";
      const requestInit: RequestInit = audioFile
        ? {
            method: "POST",
            body: buildAudioFormData(form, audioFile, trimmedApiKey),
          }
        : {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-openai-api-key": trimmedApiKey,
            },
            body: JSON.stringify(form),
          };

      const response = await fetch(endpoint, requestInit);
      const payload = await readGeneratePayload(response);

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
              Lyrics to Vocal Score
            </p>
            <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">
              歌唱譜メーカー
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              通常歌詞と音源をもとに、Sunoでも人間でも歌いやすい「歌唱譜」へ整えます。
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
                <span className="text-sm font-semibold text-slate-200">
                  OpenAI APIキー
                </span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="sk-..."
                  autoComplete="off"
                  className="h-11 w-full rounded-lg border border-white/10 bg-ink/80 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-rain/60 focus:ring-2 focus:ring-rain/25"
                />
                <p className="text-xs leading-6 text-slate-500">
                  入力したキーは生成時だけ使い、このツールには保存しません。
                </p>
              </label>

              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <FileAudio2 className="text-rain" size={18} />
                  音源アップロード
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  音源をアップロードすると、元歌詞と照らし合わせながら、より実際のメロディーに近い歌唱譜を作れます。
                </p>
                <label className="mt-3 block space-y-2">
                  <span className="sr-only">音源ファイル</span>
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.aac,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/aac"
                    onChange={(event) => handleAudioChange(event.target.files?.[0] ?? null)}
                    className="block w-full cursor-pointer rounded-lg border border-white/10 bg-ink/80 text-sm text-slate-200 file:mr-3 file:h-10 file:border-0 file:bg-rain file:px-3 file:text-sm file:font-bold file:text-ink hover:file:bg-cyan-300"
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  対応形式: mp3 / wav / m4a / aac、4MB以内
                </p>
                {audioFile ? (
                  <p className="mt-2 rounded-lg border border-rain/20 bg-rain/10 px-3 py-2 text-xs text-rain">
                    {audioFile.name} / {(audioFile.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                ) : null}
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">曲の雰囲気</span>
                <input
                  value={form.mood ?? ""}
                  onChange={(event) => updateField("mood", event.target.value)}
                  placeholder="切ないJ-POP / 明るいポップロック"
                  className="h-11 w-full rounded-lg border border-white/10 bg-ink/80 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-rain/60 focus:ring-2 focus:ring-rain/25"
                />
              </label>

              <ModeSelector<StretchLevel>
                label="伸ばし表記"
                value={form.stretchLevel}
                options={stretchLevelOptions}
                onChange={(value) => updateField("stretchLevel", value)}
                columns="three"
              />

              <div className="rounded-lg border border-rain/20 bg-rain/10 px-3 py-2 text-xs leading-6 text-cyan-100">
                <span className="font-semibold">ふわり補正：常にON</span>
                <br />
                歌詞の流れを壊さず、自然な伸ばし・区切りになるように整えます。
              </div>

              {error ? (
                <div className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || !form.lyrics.trim() || !apiKey.trim()}
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
                    歌詞を入れて、必要なら音源を添えて生成してください。
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
