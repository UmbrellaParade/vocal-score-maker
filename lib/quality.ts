import type { SingingChartRequest, SingingChartResponse } from "@/types/singing-chart";

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function nonEmptyLineCount(value: string) {
  return value.split(/\r?\n/).filter((line) => line.trim()).length;
}

function hasJapanese(value: string) {
  return /[ぁ-んァ-ン一-龥]/.test(value);
}

export function findSingingChartQualityIssues(
  request: SingingChartRequest,
  result: SingingChartResponse,
) {
  const issues: string[] = [];
  const originalLines = request.lyrics.split(/\r?\n/);
  const originalNonEmptyLines = nonEmptyLineCount(request.lyrics);
  const originalBlankLines = originalLines.filter((line) => !line.trim()).length;
  const chart = result.singingChart;
  const chartNonEmptyLines = nonEmptyLineCount(chart);
  const chartBlankLines = chart.split(/\r?\n/).filter((line) => !line.trim()).length;
  const slashCount = countMatches(chart, /\//g);
  const stretchCount = countMatches(chart, /ー/g);

  if (originalLines.length > 1 && !/\r?\n/.test(chart)) {
    issues.push("歌唱譜が1行になっている");
  }

  if (originalNonEmptyLines >= 2 && chartNonEmptyLines < Math.min(originalNonEmptyLines, 3)) {
    issues.push("元歌詞の行構造が不足している");
  }

  if (originalBlankLines > 0 && chartBlankLines === 0) {
    issues.push("元歌詞の空行が保持されていない");
  }

  if (hasJapanese(request.lyrics) && request.lyrics.length >= 16 && stretchCount < 2) {
    issues.push("伸ばし表記が少なすぎる");
  }

  if (chartNonEmptyLines <= 2 && slashCount >= 5) {
    issues.push("スラッシュ区切りが多すぎる");
  }

  return issues;
}

export function needsSingingChartRepair(
  request: SingingChartRequest,
  result: SingingChartResponse,
) {
  return findSingingChartQualityIssues(request, result).length > 0;
}
