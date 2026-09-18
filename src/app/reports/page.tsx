import type { Metadata } from "next";
import { DataLoadError } from "@/components/dashboard/DataLoadError";
import { ReportDataSummary } from "@/components/reports/ReportDataSummary";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { ReportPageHeader } from "@/components/reports/ReportPageHeader";
import { ReportProcessSteps } from "@/components/reports/ReportProcessSteps";
import { hasServerAiApiKey } from "@/lib/reports/ai-config";
import { getReportStats } from "@/lib/reports/get-report-stats";

export const metadata: Metadata = {
  title: "AI 인사보고서",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const statsResult = await getReportStats();
  const aiConfigured = hasServerAiApiKey();

  if (!statsResult.ok) {
    return (
      <>
        <ReportPageHeader asOfDate={null} />
        <DataLoadError title="보고서용 집계 데이터를 불러오지 못했습니다." />
      </>
    );
  }

  return (
    <>
      <ReportPageHeader asOfDate={statsResult.stats.asOfDate} />
      <div className="space-y-6">
        <ReportDataSummary stats={statsResult.stats} />
        <ReportProcessSteps />
        <ReportGenerator aiConfigured={aiConfigured} />
      </div>
    </>
  );
}
