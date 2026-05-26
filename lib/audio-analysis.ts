export type TranscriptionSegmentSummary = {
  startTime?: string;
  endTime?: string;
  text: string;
};

export type AudioAnalysisSummary = {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  transcriptionText: string;
  segments: TranscriptionSegmentSummary[];
  segmentSummary: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object";
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function formatSeconds(seconds: number | undefined) {
  if (seconds === undefined) {
    return undefined;
  }

  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const rest = rounded % 60;

  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function buildAudioAnalysisSummary(
  transcription: unknown,
  file: File,
): AudioAnalysisSummary {
  if (typeof transcription === "string") {
    return {
      fileName: file.name,
      fileType: file.type || "unknown",
      fileSizeBytes: file.size,
      transcriptionText: transcription,
      segments: [],
      segmentSummary: "",
    };
  }

  const record = isRecord(transcription) ? transcription : {};
  const text = asString(record.text);
  const rawSegments = Array.isArray(record.segments) ? record.segments : [];

  const segments = rawSegments
    .map((segment) => {
      const segmentRecord = isRecord(segment) ? segment : {};

      return {
        startTime: formatSeconds(asNumber(segmentRecord.start)),
        endTime: formatSeconds(asNumber(segmentRecord.end)),
        text: asString(segmentRecord.text).trim(),
      };
    })
    .filter((segment) => segment.text);

  return {
    fileName: file.name,
    fileType: file.type || "unknown",
    fileSizeBytes: file.size,
    transcriptionText: text,
    segments,
    segmentSummary: segments
      .map((segment) => {
        const range =
          segment.startTime && segment.endTime
            ? `${segment.startTime}-${segment.endTime}`
            : "時刻不明";

        return `${range} ${segment.text}`;
      })
      .join("\n"),
  };
}

export function formatAudioFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
