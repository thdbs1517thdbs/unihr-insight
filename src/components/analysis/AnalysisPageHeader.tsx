import { formatDateLabel } from "@/lib/analysis/format";

type AnalysisPageHeaderProps = {
  asOfDate: string | null;
  selectedOrg: string | null;
};

export function AnalysisPageHeader({
  asOfDate,
  selectedOrg,
}: AnalysisPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          인사현황 분석
        </h1>
        <span className="rounded border border-navy-800/20 bg-white px-2.5 py-1 text-xs font-medium tracking-wide text-navy-800">
          ANALYZE
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        교직원 인력 구성과 조직·고용형태별 현황을 분석합니다.
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted">분석 기준일</dt>
          <dd className="tabular font-medium text-navy-900">
            {asOfDate ? formatDateLabel(asOfDate) : "확인 불가"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted">집계 범위</dt>
          <dd className="font-medium text-navy-900">
            {selectedOrg ?? "대학 전체 · 퇴직 제외"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
