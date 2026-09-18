import { StatCard } from "@/components/dashboard/StatCard";
import { formatNumber } from "@/lib/format";
import type { VerificationKpis } from "@/lib/verification/types";

type VerificationKpiCardsProps = {
  kpis: VerificationKpis;
};

export function VerificationKpiCards({ kpis }: VerificationKpiCardsProps) {
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="전체 검증 항목"
        value={kpis.total}
        unit="건"
        note="disclosure_statistics 전체"
        tone="navy"
      />
      <StatCard
        label="일치"
        value={kpis.matched}
        unit="건"
        note="시스템 집계 = 제출자료"
        tone="blue"
      />
      <StatCard
        label="불일치"
        value={kpis.mismatched}
        unit="건"
        note="시스템 집계 ≠ 제출자료"
        tone="amber"
      />
      <StatCard
        label="일치율"
        value={kpis.matchRate}
        unit="%"
        note={`일치 ${formatNumber(kpis.matched)} / 전체 ${formatNumber(kpis.total)}`}
        tone="slate"
      />
    </section>
  );
}
