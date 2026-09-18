import type { Metadata } from "next";
import { AnalysisKpiCards } from "@/components/analysis/AnalysisKpiCards";
import { AnalysisPageHeader } from "@/components/analysis/AnalysisPageHeader";
import { AppointmentPanel } from "@/components/analysis/AppointmentPanel";
import { DonutChart } from "@/components/analysis/DonutChart";
import { HorizontalBarChart } from "@/components/analysis/HorizontalBarChart";
import { OrganizationPanel } from "@/components/analysis/OrganizationPanel";
import { TrendLineChart } from "@/components/analysis/TrendLineChart";
import { DataLoadError } from "@/components/dashboard/DataLoadError";
import { getAnalysisData } from "@/lib/analysis/get-analysis-data";

export const metadata: Metadata = {
  title: "인사현황 분석",
};

export const dynamic = "force-dynamic";

const FACULTY_COLORS = ["#1b3a63", "#3b82f6"];
const STAFF_COLORS = ["#1b3a63", "#234a7d", "#64748b"];

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string | string[] }>;
}) {
  const params = await searchParams;
  const selectedOrg =
    typeof params.org === "string" && params.org.trim()
      ? params.org.trim()
      : null;

  const result = await getAnalysisData(selectedOrg);

  if (!result.ok) {
    return (
      <>
        <AnalysisPageHeader asOfDate={null} selectedOrg={null} />
        <DataLoadError title="인사현황 분석 데이터를 불러오지 못했습니다." />
      </>
    );
  }

  const { data } = result;
  const { breakdown } = data;

  return (
    <>
      <AnalysisPageHeader
        asOfDate={data.asOfDate}
        selectedOrg={data.selectedOrg}
      />
      <AnalysisKpiCards kpis={breakdown.kpis} />
      <p className="mb-6 text-sm text-slate-600">
        {breakdown.insights.facultyShare} {breakdown.insights.staffShare}
      </p>
      <TrendLineChart snapshots={data.snapshots} />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-navy-900">교원 구성 분석</h2>
          <DonutChart
            title="전임 / 비전임"
            note="현재 재직 교원, 교원유형이 있는 인원"
            items={breakdown.facultyTypes}
            colors={FACULTY_COLORS}
            insight={breakdown.insights.facultyTenure}
          />
          <HorizontalBarChart
            title="전임교원 직급"
            note="교수·부교수·조교수"
            items={breakdown.facultyGrades}
            insight={breakdown.insights.facultyTenure}
          />
          <HorizontalBarChart
            title="비전임유형"
            note="비전임교원만 집계"
            items={breakdown.nonTenureTypes}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-navy-900">직원 구성 분석</h2>
          <DonutChart
            title="고용형태"
            note="현재 재직 직원, 고용형태가 있는 인원"
            items={breakdown.staffEmploymentTypes}
            colors={STAFF_COLORS}
            insight={breakdown.insights.staffEmployment}
          />
          <HorizontalBarChart
            title="직군"
            note="일반행정·전산·시설·사서·연구·산학, 그 외는 기타"
            items={breakdown.staffJobGroups}
          />
          <HorizontalBarChart
            title="직원 직급"
            note="일반직 급수 및 실제 직급 값"
            items={breakdown.staffGrades}
          />
        </div>
      </div>

      <OrganizationPanel
        organizations={breakdown.organizations}
        selectedOrg={data.selectedOrg}
      />
      <AppointmentPanel appointments={data.appointments} />
    </>
  );
}
