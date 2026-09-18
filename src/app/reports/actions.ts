"use server";

import { getServerAiApiKey, getServerAiModel, hasServerAiApiKey } from "@/lib/reports/ai-config";
import { generateGeminiReportText } from "@/lib/reports/gemini";
import { getReportStats } from "@/lib/reports/get-report-stats";
import { reportStatsHasPersonalData } from "@/lib/reports/build-context";
import { buildReportUserPrompt, REPORT_SYSTEM_PROMPT } from "@/lib/reports/prompts";
import {
  REPORT_TONES,
  REPORT_TYPE_LABELS,
  REPORT_TYPES,
  type GeneratedReport,
  type ReportTone,
  type ReportType,
} from "@/lib/reports/types";

export type GenerateReportResult =
  | {
      ok: false;
      code: "not_configured" | "invalid" | "unavailable" | "quota";
      message: string;
    }
  | { ok: true; report: GeneratedReport };

function isReportType(value: string): value is ReportType {
  return (REPORT_TYPES as readonly string[]).includes(value);
}

function isReportTone(value: string): value is ReportTone {
  return (REPORT_TONES as readonly string[]).includes(value);
}

export async function generateHrReportDraft(input: {
  reportType: string;
  tone: string;
}): Promise<GenerateReportResult> {
  if (!isReportType(input.reportType) || !isReportTone(input.tone)) {
    return {
      ok: false,
      code: "invalid",
      message: "선택한 보고서 유형 또는 문체가 올바르지 않습니다.",
    };
  }

  if (!hasServerAiApiKey()) {
    return {
      ok: false,
      code: "not_configured",
      message:
        "Gemini API가 연결되지 않았습니다. 집계 데이터는 준비되어 있으며, 연결 후 초안을 생성할 수 있습니다.",
    };
  }

  const statsResult = await getReportStats();
  if (!statsResult.ok) {
    return {
      ok: false,
      code: "unavailable",
      message: "보고서용 집계 데이터를 불러오지 못했습니다.",
    };
  }

  if (reportStatsHasPersonalData(statsResult.stats)) {
    return {
      ok: false,
      code: "unavailable",
      message: "보고서용 집계 데이터에 허용되지 않은 항목이 있어 생성을 중단했습니다.",
    };
  }

  const apiKey = getServerAiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      code: "not_configured",
      message:
        "Gemini API가 연결되지 않았습니다. 집계 데이터는 준비되어 있으며, 연결 후 초안을 생성할 수 있습니다.",
    };
  }

  const gemini = await generateGeminiReportText({
    apiKey,
    model: getServerAiModel(),
    systemPrompt: REPORT_SYSTEM_PROMPT,
    userPrompt: buildReportUserPrompt(
      statsResult.stats,
      input.reportType,
      input.tone,
    ),
  });

  if (!gemini.ok) {
    return {
      ok: false,
      code: gemini.code === "quota" ? "quota" : "unavailable",
      message: gemini.message,
    };
  }

  return {
    ok: true,
    report: {
      title: REPORT_TYPE_LABELS[input.reportType],
      asOfDate: statsResult.stats.asOfDate,
      generatedAt: new Date().toISOString(),
      body: gemini.text,
      reportType: input.reportType,
      tone: input.tone,
    },
  };
}
