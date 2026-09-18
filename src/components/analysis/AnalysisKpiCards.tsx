import { StatCard } from "@/components/dashboard/StatCard";
import { formatPercent } from "@/lib/analysis/format";
import type { AnalysisKpis } from "@/lib/analysis/types";

type AnalysisKpiCardsProps = {
  kpis: AnalysisKpis;
};

export function AnalysisKpiCards({ kpis }: AnalysisKpiCardsProps) {
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="총 현원"
        value={kpis.total}
        unit="명"
        note="재직상태 퇴직 제외"
        tone="navy"
      />
      <StatCard
        label="교원"
        value={kpis.faculty}
        unit="명"
        note={`전체 현원의 ${formatPercent(kpis.faculty, kpis.total)}%`}
        tone="blue"
      />
      <StatCard
        label="직원"
        value={kpis.staff}
        unit="명"
        note={`전체 현원의 ${formatPercent(kpis.staff, kpis.total)}%`}
        tone="slate"
      />
      <StatCard
        label="휴직"
        value={kpis.leave}
        unit="명"
        note={`현원 중 ${formatPercent(kpis.leave, kpis.total)}%`}
        tone="amber"
      />
    </section>
  );
}
