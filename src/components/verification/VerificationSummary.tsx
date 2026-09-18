import { DonutChart } from "@/components/analysis/DonutChart";
import { formatNumber } from "@/lib/format";
import type { CategorySummary, VerificationKpis } from "@/lib/verification/types";

type VerificationSummaryProps = {
  kpis: VerificationKpis;
  categories: CategorySummary[];
};

export function VerificationSummary({
  kpis,
  categories,
}: VerificationSummaryProps) {
  const donutItems = [
    { label: "일치", count: kpis.matched },
    { label: "불일치", count: kpis.mismatched },
    { label: "확인 필요", count: kpis.pending },
  ].filter((item) => item.count > 0);

  return (
    <section className="mb-6 grid gap-4 lg:grid-cols-2">
      <DonutChart
        title="검증 결과 비율"
        note="시스템 집계와 제출자료를 비교한 결과입니다."
        items={donutItems}
        colors={["#1b3a63", "#d97706", "#94a3b8"]}
        insight={`전체 ${formatNumber(kpis.total)}건 = 일치 ${formatNumber(kpis.matched)} + 불일치 ${formatNumber(kpis.mismatched)} + 확인 필요 ${formatNumber(kpis.pending)}`}
      />
      <section className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-sm font-semibold text-navy-900">통계 구분별 검증</h3>
          <p className="mt-1 text-xs text-muted">
            report_category 기준 항목 수입니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">통계 구분</th>
                <th className="px-5 py-3 font-medium">전체</th>
                <th className="px-5 py-3 font-medium">일치</th>
                <th className="px-5 py-3 font-medium">불일치</th>
                <th className="px-5 py-3 font-medium">확인 필요</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => (
                <tr key={item.reportCategory} className="border-t border-line">
                  <td className="px-5 py-3 text-navy-900">{item.reportCategory}</td>
                  <td className="tabular px-5 py-3 text-slate-700">
                    {formatNumber(item.total)}
                  </td>
                  <td className="tabular px-5 py-3 text-slate-700">
                    {formatNumber(item.matched)}
                  </td>
                  <td className="tabular px-5 py-3 text-slate-700">
                    {formatNumber(item.mismatched)}
                  </td>
                  <td className="tabular px-5 py-3 text-slate-700">
                    {formatNumber(item.pending)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
