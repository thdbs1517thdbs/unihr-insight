import { StatCard } from "@/components/dashboard/StatCard";
import { formatNumber } from "@/lib/format";
import type { QualitySummary } from "@/lib/quality/types";

type QualitySummaryCardsProps = {
  summary: QualitySummary;
};

export function QualitySummaryCards({ summary }: QualitySummaryCardsProps) {
  return (
    <section className="mb-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="전체 점검 인원"
          value={summary.checkedCount}
          unit="명"
          note="현재 인사원장 전체"
          tone="navy"
        />
        <StatCard
          label="정상"
          value={summary.normalCount}
          unit="명"
          note="점검 규칙에 해당하지 않음"
          tone="blue"
        />
        <StatCard
          label="확인 필요"
          value={summary.issueEmployeeCount}
          unit="명"
          note={`문제 ${formatNumber(summary.issueCount)}건`}
          tone="amber"
        />
        <StatCard
          label="오류 유형 수"
          value={summary.typeCount}
          unit="개"
          note="현재 발생한 문제 유형"
          tone="slate"
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        확인 필요는 문제 직원 수입니다. 한 명에게 여러 문제가 있으면 아래 목록의
        문제 건수와 달라질 수 있습니다.
      </p>
    </section>
  );
}
