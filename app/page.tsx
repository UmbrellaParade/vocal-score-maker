"use client";

import { FileAudio2, LoaderCircle, Music2, WandSparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { LyricsInput } from "@/components/LyricsInput";
import { ModeSelector } from "@/components/ModeSelector";
import { SingingChartView } from "@/components/SingingChartView";
import { buildAudioAnalysisSummary } from "@/lib/audio-analysis";
import {
  maxAudioFileBytes,
  maxAudioFileMegabytes,
  supportedAudioFormatsText,
} from "@/lib/audio-limits";
import { stretchLevelOptions } from "@/lib/options";
import type {
  SingingChartRequest,
  SingingChartResponse,
  StretchLevel,
} from "@/types/singing-chart";

const sampleLyrics = "ねぇ まただよ通知一つで\n胸がざわつく";

const defaultForm: SingingChartRequest = {
  lyrics: "",
  mood: "切ないJ-POP",
  stretchLevel: "standard",
};

type GeneratePayload = {
  result?: SingingChartResponse;
  error?: string;
};

type OpenAIErrorPayload = {
  error?: {
    message?: string;
  };
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
        `送信内容が大きすぎます。音源は${maxAudioFileMegabytes}MB以内にして再度お試しください。`,
    };
  }

  return {
    error: text || "生成に失敗しました。時間をおいて再度お試しください。",
  };
}

async function transcribeAudioFile(
  file: File,
  apiKey: string,
  lyrics: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("language", "ja");
  formData.append("prompt", lyrics.slice(0, 1200));
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "segment");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as OpenAIErrorPayload | unknown)
    : await response.text();

  if (!response.ok) {
    const openAIMessage =
      typeof payload === "object" &&
      payload &&
      "error" in payload &&
      typeof (payload as OpenAIErrorPayload).error?.message === "string"
        ? (payload as OpenAIErrorPayload).error?.message
        : "";

    if (response.status === 401) {
      throw new Error("OpenAI APIキーが正しいか確認してください。");
    }

    if (response.status === 413 || openAIMessage?.includes("maximum")) {
      throw new Error(
        `音源ファイルが大きすぎます。${maxAudioFileMegabytes}MB以内の音源にしてください。`,
      );
    }

    throw new Error(
      openAIMessage
        ? `音源の文字起こしに失敗しました: ${openAIMessage}`
        : "音源の文字起こしに失敗しました。音源形式や長さを確認してください。",
    );
  }

  return payload;
}

export default function Home() {
  const [form, setForm] = useState<SingingChartRequest>(defaultForm);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<SingingChartResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  function updateField<K extends keyof SingingChartRequest>(
    key: K,
    value: SingingChartRequest[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAudioChange(file: File | null) {
    setError("");

    if (file && file.size > maxAudioFileBytes) {
      setAudioFile(null);
      setError(
        `音源ファイルが大きすぎます。${maxAudioFileMegabytes}MB以内の音源にしてください。`,
      );
      return;
    }

    setAudioFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedApiKey = apiKey.trim();

    if (!trimmedApiKey) {
      setError("OpenAI APIキーを入力してください。");
      return;
    }

    if (audioFile && audioFile.size > maxAudioFileBytes) {
      setError(
        `音源ファイルが大きすぎます。${maxAudioFileMegabytes}MB以内の音源にしてください。`,
      );
      return;
    }

    setIsLoading(true);
    setLoadingMessage(audioFile ? "音源を解析中" : "生成中");

    try {
      const audioAnalysis = audioFile
        ? buildAudioAnalysisSummary(
            await transcribeAudioFile(audioFile, trimmedApiKey, form.lyrics),
            audioFile,
          )
        : undefined;

      setLoadingMessage("歌唱譜を生成中");

      const response = await fetch("/api/generate-singing-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-api-key": trimmedApiKey,
        },
        body: JSON.stringify({ ...form, audioAnalysis }),
      });
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
      setLoadingMessage("");
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
                  キーは保存しません。音源解析と生成の時だけOpenAIに送ります。
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
                  対応形式: {supportedAudioFormatsText}、{maxAudioFileMegabytes}MB以内
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
                {isLoading ? loadingMessage || "生成中" : "生成する"}
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
