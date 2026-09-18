"use client";

import { useState, useTransition } from "react";
import { generateHrReportDraft } from "@/app/reports/actions";
import { ReportMarkdown } from "@/components/reports/ReportMarkdown";
import { formatDateLabel } from "@/lib/analysis/format";
import {
  REPORT_TONE_LABELS,
  REPORT_TONES,
  REPORT_TYPE_LABELS,
  REPORT_TYPES,
  type GeneratedReport,
  type ReportTone,
  type ReportType,
} from "@/lib/reports/types";

type ReportGeneratorProps = {
  aiConfigured: boolean;
};

const selectClass =
  "h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700";

export function ReportGenerator({ aiConfigured }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [tone, setTone] = useState<ReportTone>("concise");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [report, setReport] = useState<GeneratedReport | null>(null);

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateHrReportDraft({ reportType, tone });
      if (!result.ok) {
        setReport(null);
        setMessage(result.message);
        return;
      }
      setMessage(null);
      setReport(result.report);
    });
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">보고서 초안 생성</h2>
      <p className="mt-1 text-xs text-muted">
        유형과 문체를 선택한 뒤 집계 데이터만 생성형 AI에 전달합니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            보고서 유형
          </span>
          <select
            value={reportType}
            onChange={(event) =>
              setReportType(event.target.value as ReportType)
            }
            className={selectClass}
          >
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {REPORT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            보고서 톤
          </span>
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as ReportTone)}
            className={selectClass}
          >
            {REPORT_TONES.map((item) => (
              <option key={item} value={item}>
                {REPORT_TONE_LABELS[item]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={handleGenerate}
          className="h-9 rounded-md bg-navy-800 px-4 text-sm font-medium text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "생성 중..." : "보고서 초안 생성"}
        </button>
        {report ? (
          <button
            type="button"
            disabled={pending}
            onClick={handleGenerate}
            className="h-9 rounded-md border border-line px-4 text-sm font-medium text-navy-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            다시 생성
          </button>
        ) : null}
      </div>

      {!aiConfigured ? (
        <div className="mt-4 rounded-md border border-line bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-medium text-navy-900">보고서 생성 준비 완료</p>
          <p className="mt-1">검증된 통계 데이터가 준비되었습니다.</p>
          <p className="mt-1">
            Gemini API 연결 후 보고서 초안을 생성할 수 있습니다.
          </p>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 text-sm text-navy-800">{message}</p>
      ) : null}

      {report ? <ReportResult report={report} /> : null}
    </section>
  );
}

function ReportResult({ report }: { report: GeneratedReport }) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  function reportText() {
    return [
      report.title,
      `기준일: ${report.asOfDate ? formatDateLabel(report.asOfDate) : "확인 불가"}`,
      `생성 시각: ${formatDateLabel(report.generatedAt)} ${report.generatedAt.slice(11, 16)}`,
      "",
      report.body,
    ].join("\n");
  }

  async function copyReport() {
    await navigator.clipboard.writeText(reportText());
    setCopyState("copied");
  }

  function downloadMarkdown() {
    const blob = new Blob([reportText()], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-5 border-t border-line pt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-navy-900">{report.title}</h3>
          <p className="mt-1 text-xs text-muted">
            기준일 {report.asOfDate ? formatDateLabel(report.asOfDate) : "확인 불가"}
            {" · "}
            생성 {formatDateLabel(report.generatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void copyReport();
            }}
            className="h-9 rounded-md border border-line px-3 text-sm text-navy-800 hover:bg-slate-50"
          >
            {copyState === "copied" ? "복사됨" : "클립보드 복사"}
          </button>
          <button
            type="button"
            onClick={downloadMarkdown}
            className="h-9 rounded-md border border-line px-3 text-sm text-navy-800 hover:bg-slate-50"
          >
            Markdown 다운로드
          </button>
        </div>
      </div>
      <div className="mt-4">
        <ReportMarkdown markdown={report.body} />
      </div>
      <p className="mt-4 text-xs text-muted">
        본 문서는 생성형 AI가 작성한 초안이며, 최종 제출 전 담당자의 검토가
        필요합니다.
      </p>
    </div>
  );
}
