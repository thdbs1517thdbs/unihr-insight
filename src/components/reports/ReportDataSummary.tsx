import { formatDateLabel } from "@/lib/analysis/format";
import { formatNumber } from "@/lib/format";
import type { ReportStats } from "@/lib/reports/types";

type ReportDataSummaryProps = {
  stats: ReportStats;
};

export function ReportDataSummary({ stats }: ReportDataSummaryProps) {
  const verification = stats.verification;

  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">
        이번 보고서에 사용되는 데이터
      </h2>
      <p className="mt-1 text-xs text-muted">
        ANALYZE·VERIFY에서 계산·검증된 집계 결과입니다.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryItem
          label="기준일"
          value={stats.asOfDate ? formatDateLabel(stats.asOfDate) : "확인 불가"}
        />
        <SummaryItem
          label="총 현원"
          value={`${formatNumber(stats.headcount.total)}명`}
        />
        <SummaryItem
          label="교원"
          value={`${formatNumber(stats.headcount.faculty)}명`}
        />
        <SummaryItem
          label="직원"
          value={`${formatNumber(stats.headcount.staff)}명`}
        />
        <SummaryItem
          label="휴직"
          value={`${formatNumber(stats.headcount.leave)}명`}
        />
        {verification.available ? (
          <>
            <SummaryItem
              label="통계 검증"
              value={`${formatNumber(verification.total)}건`}
            />
            <SummaryItem
              label="불일치"
              value={`${formatNumber(verification.mismatched)}건`}
            />
          </>
        ) : (
          <SummaryItem label="통계 검증" value="조회 대기" />
        )}
      </dl>
      <p className="mt-4 text-xs leading-5 text-slate-600">
        개인 식별정보는 생성형 AI에 전달하지 않으며, 집계·검증된 통계정보만
        보고서 작성에 사용합니다.
      </p>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line px-3 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 tabular text-sm font-medium text-navy-900">{value}</dd>
    </div>
  );
}
